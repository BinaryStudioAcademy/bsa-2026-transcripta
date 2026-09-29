import fastifyMultipart from "@fastify/multipart";
import fastifyRateLimit from "@fastify/rate-limit";
import fastifyStatic from "@fastify/static";
import swagger, { type StaticDocumentSpec } from "@fastify/swagger";
import swaggerUi from "@fastify/swagger-ui";
import Fastify, { type FastifyError, type FastifyInstance } from "fastify";
import { Redis } from "ioredis";
import { existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { ServerErrorType } from "~/libs/enums/enums.js";
import { type ValidationError } from "~/libs/exceptions/exceptions.js";
import { AuthRateLimitErrorMessage } from "~/libs/modules/auth/libs/enums/enums.js";
import { type Config } from "~/libs/modules/config/config.js";
import { type Database } from "~/libs/modules/database/database.js";
import { HTTPCode, HTTPError } from "~/libs/modules/http/http.js";
import { type Logger } from "~/libs/modules/logger/logger.js";
import { closeRedisConnection } from "~/libs/modules/queue/libs/helpers/helpers.js";
import { registerQueueBoard } from "~/libs/modules/queue/queue-board.module.js";
import { type QueueRegistry } from "~/libs/modules/queue/queue-registry.module.js";
import { DocumentCleanupQueue } from "~/libs/modules/queue/queue.js";
import {
	type ServerCommonErrorResponse,
	type ServerValidationErrorResponse,
	type ValidationSchema,
} from "~/libs/types/types.js";

import {
	DEFAULT_VALIDATION_ERROR_MESSAGE,
	INVALID_JSON_BODY_ERROR_MESSAGE,
	ShutdownLoggerMessages,
} from "./libs/constants/constants.js";
import {
	type ServerApplication,
	type ServerApplicationApi,
	type ServerApplicationRouteParameters,
} from "./libs/types/types.js";

const MEGABYTE = 1_048_576;
const FILE_SIZE_LIMIT_MB = 20;
const FILE_SIZE_LIMIT = FILE_SIZE_LIMIT_MB * MEGABYTE;

type Constructor = {
	apis: ServerApplicationApi[];
	config: Config;
	database: Database;
	documentCleanupQueue: DocumentCleanupQueue;
	logger: Logger;
	queueRegistry: QueueRegistry;
	title: string;
};

type ShutdownClosing = {
	close: () => Promise<unknown>;
	name: string;
};

class BaseServerApplication implements ServerApplication {
	private apis: ServerApplicationApi[];

	private app!: FastifyInstance;

	private config: Config;

	private database: Database;

	private documentCleanupQueue: DocumentCleanupQueue;

	private isShuttingDown = false;

	private logger: Logger;

	private queueRegistry: QueueRegistry;

	private rateLimitConnection: null | Redis = null;

	private title: string;

	public constructor({
		apis,
		config,
		database,
		documentCleanupQueue,
		logger,
		queueRegistry,
		title,
	}: Constructor) {
		this.title = title;
		this.config = config;
		this.logger = logger;
		this.database = database;
		this.apis = apis;
		this.queueRegistry = queueRegistry;
		this.documentCleanupQueue = documentCleanupQueue;

		this.initApp();
	}

	private initApp(): void {
		this.app = Fastify({
			ignoreTrailingSlash: true,
		});
	}

	private initErrorHandler(): void {
		this.app.setErrorHandler(
			(error: FastifyError | ValidationError, _request, reply) => {
				if ("issues" in error) {
					this.logger.error(`[Validation Error]: ${error.message}`);

					for (let issue of error.issues) {
						this.logger.error(`[${issue.path.toString()}] — ${issue.message}`);
					}

					const response: ServerValidationErrorResponse = {
						details: error.issues.map((issue) => ({
							message: issue.message,
							path: issue.path,
						})),
						errorType: ServerErrorType.VALIDATION,
						message: DEFAULT_VALIDATION_ERROR_MESSAGE,
					};

					return reply.status(HTTPCode.UNPROCESSED_ENTITY).send(response);
				}

				if (error instanceof HTTPError) {
					this.logger.error(
						`[HTTP Error]: ${error.status.toString()} – ${error.message}`,
					);

					const response: ServerCommonErrorResponse = {
						errorType: ServerErrorType.COMMON,
						message: error.message,
					};

					return reply.status(error.status).send(response);
				}

				if (
					("statusCode" in error &&
						error.statusCode === HTTPCode.BAD_REQUEST) ||
					error instanceof SyntaxError
				) {
					this.logger.error(`[Bad Request]: ${error.message}`);

					const response: ServerCommonErrorResponse = {
						errorType: ServerErrorType.COMMON,
						message: INVALID_JSON_BODY_ERROR_MESSAGE,
					};

					return reply.status(HTTPCode.BAD_REQUEST).send(response);
				}

				this.logger.error(error.message);

				const response: ServerCommonErrorResponse = {
					errorType: ServerErrorType.COMMON,
					message: error.message,
				};

				return reply.status(HTTPCode.INTERNAL_SERVER_ERROR).send(response);
			},
		);
	}

	private async initServe(): Promise<void> {
		const buildPath = path.dirname(fileURLToPath(import.meta.url));
		const staticPath = path.join(buildPath, "../../../../public");
		// In the image the design package sits next to `public`; in the repo it
		// lives at the root, four levels up from src/libs/modules/…
		const bundledDesignPath = path.join(buildPath, "../../../../design");
		const designPath = existsSync(bundledDesignPath)
			? bundledDesignPath
			: path.join(buildPath, "../../../../../../design");

		await this.app.register(fastifyStatic, {
			prefix: "/",
			root: staticPath,
		});

		// The design package is a static export from Claude Design — the same
		// files the team opens locally on :8123, served here so a reviewer only
		// needs a link. Its own hub is view.html.
		await this.app.register(fastifyStatic, {
			decorateReply: false,
			prefix: "/design/",
			root: designPath,
		});

		this.app.setNotFoundHandler(async (request, response) => {
			if (request.url.startsWith("/design/")) {
				return await response
					.status(HTTPCode.NOT_FOUND)
					.send({ message: "Not found" });
			}

			return await response.sendFile("index.html", staticPath);
		});
	}
	private initShutdown(): void {
		for (const signal of ["SIGINT", "SIGTERM"] as const) {
			process.once(signal, () => {
				void this.shutdown();
			});
		}
	}

	private initValidationCompiler(): void {
		this.app.setValidatorCompiler<ValidationSchema>(({ schema }) => {
			return (data: unknown) => {
				const result = schema.safeParse(data);

				if (!result.success) {
					return { error: result.error };
				}

				return { value: result.data as unknown };
			};
		});
	}

	/**
	 * Runs once, whether the process is stopping on a signal or on a boot that
	 * already failed, and returns only when every handle it owns is closed —
	 * the process then exits on its own instead of hanging on the first socket
	 * nobody closed.
	 */
	private async shutdown(): Promise<void> {
		if (this.isShuttingDown) {
			return;
		}

		this.isShuttingDown = true;

		// Order matters: closing the workers waits for the job in flight, so the
		// connections that job needs have to outlive it.
		const closings: ShutdownClosing[] = [
			{ close: () => this.app.close(), name: "server" },
			{ close: () => this.queueRegistry.close(), name: "queues" },
			{
				close: () => closeRedisConnection(this.rateLimitConnection),
				name: "rate limit connection",
			},
			{ close: () => this.database.disconnect(), name: "database" },
		];

		for (const closing of closings) {
			try {
				await closing.close();
			} catch (error) {
				this.logger.error(ShutdownLoggerMessages.FAILED(closing.name), {
					error,
				});
			}
		}

		this.logger.info(ShutdownLoggerMessages.CLOSED);
	}

	public addRoute(parameters: ServerApplicationRouteParameters): void {
		const { config, handler, method, path, preHandler, validation } =
			parameters;
		const preHandlers = preHandler ? [preHandler] : [];

		this.app.route({
			...(config ? { config } : {}),
			handler,
			method,
			preHandler: preHandlers,
			schema: {
				body: validation?.body,
				params: validation?.params,
				querystring: validation?.query,
			},
			url: path,
		});

		this.logger.info(`Route: ${method} ${path} is registered`);
	}

	public addRoutes(parameters: ServerApplicationRouteParameters[]): void {
		for (let parameter of parameters) {
			this.addRoute(parameter);
		}
	}

	public async init(): Promise<void> {
		this.logger.info("Application initialization…");

		await this.initServe();

		await this.initMiddlewares();

		this.initValidationCompiler();

		this.initErrorHandler();

		this.initRoutes();

		this.database.connect();

		try {
			await this.queueRegistry.connect();
			await this.documentCleanupQueue.init();

			await registerQueueBoard({
				app: this.app,
				config: this.config,
				logger: this.logger,
				queues: this.queueRegistry.getQueues(),
			});
			await this.app.listen({
				host: this.config.ENV.APP.HOST,
				port: this.config.ENV.APP.PORT,
			});

			this.logger.info(
				`Application is listening on PORT – ${this.config.ENV.APP.PORT.toString()}, on ENVIRONMENT – ${
					this.config.ENV.APP.ENVIRONMENT as string
				}.`,
			);

			this.initShutdown();
		} catch (error) {
			await this.shutdown();

			if (error instanceof Error) {
				this.logger.error(error.message, {
					cause: error.cause,
					stack: error.stack,
				});
			}

			throw error;
		}
	}

	public async initMiddlewares(): Promise<void> {
		// Files arrive as Buffers on request.body, so the existing controller
		// mapping keeps working without touching the raw request.
		await this.app.register(fastifyMultipart, {
			attachFieldsToBody: "keyValues",
			limits: { fileSize: FILE_SIZE_LIMIT },
		});

		// Kept in a field, not inlined into the plugin options: the rate limiter
		// does not close what it is given, so a connection created here and
		// dropped on the floor is exactly what kept the process alive after
		// SIGINT once the queues were already closed.
		this.rateLimitConnection = new Redis(this.config.ENV.REDIS.URL, {
			maxRetriesPerRequest: null,
		});

		await this.app.register(fastifyRateLimit, {
			errorResponseBuilder: (_request, context) => {
				throw new HTTPError({
					message: AuthRateLimitErrorMessage.TOO_MANY_REQUESTS(context.after),
					status: HTTPCode.RATE_LIMITED,
				});
			},
			global: false,
			redis: this.rateLimitConnection,
		});

		await Promise.all(
			this.apis.map(async (api) => {
				this.logger.info(
					`Generate swagger documentation for API ${api.version}`,
				);

				await this.app.register(swagger, {
					mode: "static",
					specification: {
						document: api.generateDoc(
							this.title,
						) as StaticDocumentSpec["document"],
					},
				});

				await this.app.register(swaggerUi, {
					routePrefix: `/${api.version}/documentation`,
				});
			}),
		);
	}

	public initRoutes(): void {
		const routers = this.apis.flatMap((api) => api.routes);

		this.addRoutes(routers);
	}
}

export { BaseServerApplication };
