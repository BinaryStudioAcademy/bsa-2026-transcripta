import { type Redis } from "ioredis";

import { type Logger } from "~/libs/modules/logger/logger.js";

import {
	ConnectionEvents,
	LoggerMessages,
	QueueErrorMessage,
	REDIS_CONNECT_TIMEOUT_MS,
} from "./libs/constants/constants.js";
import { closeRedisConnection, withTimeout } from "./libs/helpers/helpers.js";
import { type QueueLifecycle } from "./libs/types/types.js";

const EMPTY_ERRORS_LENGTH = 0;

type Constructor = {
	connection: Redis;
	connectTimeoutMs?: number;
	logger: Logger;
	queues: QueueLifecycle[];
};

class QueueRegistry {
	private connection: Redis;

	private connectTimeoutMs: number;

	private isConnected = false;

	private logger: Logger;

	private queues: QueueLifecycle[];

	public constructor({
		connection,
		connectTimeoutMs = REDIS_CONNECT_TIMEOUT_MS,
		logger,
		queues,
	}: Constructor) {
		this.connection = connection;
		this.connectTimeoutMs = connectTimeoutMs;
		this.logger = logger;
		this.queues = queues;

		this.connection.on(ConnectionEvents.ERROR, (error: Error) => {
			this.logger.error(LoggerMessages.REDIS_CONNECTION_ERROR, {
				error: error.message,
			});
		});
	}

	public async close(): Promise<void> {
		const errors: unknown[] = [];

		for (const queue of [...this.queues].reverse()) {
			try {
				await queue.close();
			} catch (error) {
				errors.push(error);
			}
		}

		await closeRedisConnection(this.connection);

		this.isConnected = false;
		this.logger.info(LoggerMessages.REDIS_CONNECTION_CLOSED);

		if (errors.length > EMPTY_ERRORS_LENGTH) {
			throw new AggregateError(
				errors,
				QueueErrorMessage.FAILED_TO_CLOSE_REGISTRY,
			);
		}
	}

	public async connect(): Promise<void> {
		if (this.isConnected) {
			return;
		}

		const connectedQueues: QueueLifecycle[] = [];

		try {
			await withTimeout(
				(async () => {
					await this.connection.connect();
					await this.connection.ping();
				})(),
				this.connectTimeoutMs,
				QueueErrorMessage.REDIS_UNAVAILABLE,
			);

			for (const queue of this.queues) {
				await queue.connect(this.connection);
				connectedQueues.push(queue);
			}

			this.isConnected = true;
			this.logger.info(LoggerMessages.REDIS_CONNECTED);
		} catch (error) {
			for (const queue of connectedQueues.toReversed()) {
				await queue.close().catch(() => null);
			}

			this.connection.disconnect();

			throw new Error(QueueErrorMessage.REDIS_UNAVAILABLE, { cause: error });
		}
	}
}

export { QueueRegistry };
