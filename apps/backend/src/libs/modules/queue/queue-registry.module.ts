import { type Redis } from "ioredis";

import { type Logger } from "~/libs/modules/logger/logger.js";

import { type QueueLifecycle } from "./libs/types/types.js";

const EMPTY_ERRORS_LENGTH = 0;

type Constructor = {
	connection: Redis;
	logger: Logger;
	queues: QueueLifecycle[];
};

class QueueRegistry {
	private connection: Redis;

	private isConnected = false;

	private logger: Logger;

	private queues: QueueLifecycle[];

	public constructor({ connection, logger, queues }: Constructor) {
		this.connection = connection;
		this.logger = logger;
		this.queues = queues;

		this.connection.on("error", (error) => {
			this.logger.error("Redis connection error.", {
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

		if (this.connection.status === "ready") {
			await this.connection.quit();
		} else if (this.connection.status !== "end") {
			this.connection.disconnect();
		}

		this.isConnected = false;
		this.logger.info("Redis connection closed.");

		if (errors.length > EMPTY_ERRORS_LENGTH) {
			throw new AggregateError(errors, "Failed to close queue registry.");
		}
	}

	public async connect(): Promise<void> {
		if (this.isConnected) {
			return;
		}

		const connectedQueues: QueueLifecycle[] = [];

		try {
			await this.connection.connect();
			await this.connection.ping();

			for (const queue of this.queues) {
				await queue.connect(this.connection);
				connectedQueues.push(queue);
			}

			this.isConnected = true;
			this.logger.info("Redis connected.");
		} catch (error) {
			for (const queue of connectedQueues.toReversed()) {
				await queue.close().catch(() => null);
			}

			this.connection.disconnect();

			throw new Error(
				"Redis is unavailable. Check REDIS_URL and make sure Redis is running.",
				{ cause: error },
			);
		}
	}
}

export { QueueRegistry };
