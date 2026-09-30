import { createBullBoard } from "@bull-board/api";
import { BullMQAdapter } from "@bull-board/api/dist/queueAdapters/bullMQ.js";
import { FastifyAdapter } from "@bull-board/fastify";
import fastifyBasicAuth from "@fastify/basic-auth";
import { EMPTY_LENGTH } from "@transcripta/shared";
import { type Queue } from "bullmq";
import { type FastifyInstance } from "fastify";

import { type Config } from "~/libs/modules/config/config.js";
import { type Logger } from "~/libs/modules/logger/logger.js";

import {
	QUEUE_BOARD_ROUTE,
	QueueErrorMessage,
} from "./libs/constants/constants.js";

type Options = {
	app: FastifyInstance;
	config: Config;
	logger: Logger;
	queues: QueueBoardSource[];
};

type QueueBoardSource = {
	getQueue(): null | Queue;
};

type ValidateCredentials = {
	password: string;
	username: string;
};

const isAuthorized = (
	expected: ValidateCredentials,
	received: ValidateCredentials,
): boolean =>
	expected.username === received.username &&
	expected.password === received.password;

/**
 * The board can delete, retry and drain jobs, so it is not a read-only view:
 * without a password it is an unguarded control panel over production work.
 * An empty QUEUE_BOARD_PASSWORD therefore leaves the route unregistered
 * instead of falling back to a default anyone could guess.
 */
const registerQueueBoard = async ({
	app,
	config,
	logger,
	queues,
}: Options): Promise<void> => {
	const { PASSWORD, USERNAME } = config.ENV.QUEUE_BOARD;

	if (!PASSWORD) {
		logger.info(
			"Queue board disabled: QUEUE_BOARD_PASSWORD is not set. Set it to enable the board.",
		);

		return;
	}

	// A queue only holds a BullMQ instance once the registry has connected, so
	// this must run after queueRegistry.connect().
	const connected = queues
		.map((queue) => queue.getQueue())
		.filter((queue): queue is Queue => queue !== null);

	if (connected.length === EMPTY_LENGTH) {
		logger.warn("Queue board skipped: no queue is connected yet.");

		return;
	}

	const serverAdapter = new FastifyAdapter();
	serverAdapter.setBasePath(QUEUE_BOARD_ROUTE);

	createBullBoard({
		queues: connected.map((queue) => new BullMQAdapter(queue)),
		serverAdapter,
	});

	await app.register(async (instance) => {
		await instance.register(fastifyBasicAuth, {
			authenticate: { realm: "Transcripta queues" },
			validate: async (username, password) => {
				const authorized = isAuthorized(
					{ password: PASSWORD, username: USERNAME },
					{ password, username },
				);

				if (!authorized) {
					throw new Error(QueueErrorMessage.BOARD_UNAUTHORIZED);
				}

				await Promise.resolve();
			},
		});

		instance.addHook("onRequest", instance.basicAuth);

		await instance.register(serverAdapter.registerPlugin(), {
			prefix: QUEUE_BOARD_ROUTE,
		});
	});

	logger.info(
		`Queue board is available on ${QUEUE_BOARD_ROUTE} for ${String(connected.length)} queues.`,
	);
};

export { registerQueueBoard };
