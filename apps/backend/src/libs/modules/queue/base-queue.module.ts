import {
	type Job,
	type JobsOptions,
	type Processor,
	Queue,
	Worker,
} from "bullmq";
import { type Redis } from "ioredis";

import { type Logger } from "~/libs/modules/logger/logger.js";

import {
	LoggerMessages,
	QueueErrorMessage,
} from "./libs/constants/constants.js";
import { type QueueLifecycle } from "./libs/types/types.js";

type Constructor<TData> = {
	logger: Logger;
	name: string;
	processor: Processor<TData>;
};

class BaseQueue<TData> implements QueueLifecycle {
	private logger: Logger;

	private name: string;

	private processor: Processor<TData>;

	private queue: null | Queue<Job<TData>> = null;

	private worker: null | Worker<TData, void> = null;

	public constructor({ logger, name, processor }: Constructor<TData>) {
		this.logger = logger;
		this.name = name;
		this.processor = processor;
	}

	protected async addJob(data: TData, options: JobsOptions): Promise<void> {
		if (!this.queue) {
			throw new Error(QueueErrorMessage.QUEUE_NOT_CREATED);
		}

		await this.queue.add(this.name, data, options);
	}

	public async close(): Promise<void> {
		await this.worker?.close();
		await this.queue?.close();

		this.worker = null;
		this.queue = null;

		this.logger.info(`${LoggerMessages.QUEUE_CLOSED}: ${this.name}`);
	}

	public async connect(connection: Redis): Promise<void> {
		if (this.queue && this.worker) {
			return;
		}

		let queue: null | Queue<Job<TData>> = null;
		let worker: null | Worker<TData, void> = null;

		try {
			queue = new Queue<Job<TData>>(this.name, {
				connection,
			});
			worker = new Worker<TData>(this.name, this.processor, {
				connection,
			});
			await Promise.all([queue.waitUntilReady(), worker.waitUntilReady()]);

			this.queue = queue;
			this.worker = worker;

			this.logger.info(`${LoggerMessages.QUEUE_READY}: ${this.name}`);
		} catch (error) {
			await worker?.close().catch((closeError: unknown) => {
				this.logger.error(LoggerMessages.WORKER_CLOSE_FAILED(this.name), {
					error: closeError,
				});
			});
			await queue?.close().catch((closeError: unknown) => {
				this.logger.error(LoggerMessages.QUEUE_CLOSE_FAILED(this.name), {
					error: closeError,
				});
			});

			this.logger.error(LoggerMessages.CONNECTION_FAILED(this.name), {
				error,
			});

			throw error;
		}
	}
}

export { BaseQueue };
