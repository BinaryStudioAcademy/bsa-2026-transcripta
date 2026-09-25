import {
	type Job,
	type JobsOptions,
	type Processor,
	Queue,
	type RepeatOptions,
	Worker,
} from "bullmq";
import { type Redis } from "ioredis";

import { type Logger } from "~/libs/modules/logger/logger.js";

import {
	LoggerMessages,
	QueueErrorMessage,
} from "./libs/constants/constants.js";
import {
	type QueueLifecycle,
	type QueueWorkerOptions,
} from "./libs/types/types.js";

type Constructor<TData> = {
	logger: Logger;
	name: string;
	processor: Processor<TData>;
	workerOptions?: QueueWorkerOptions;
};

class BaseQueue<TData> implements QueueLifecycle {
	private logger: Logger;

	private name: string;

	private processor: Processor<TData>;

	private queue: null | Queue<Job<TData>> = null;

	private worker: null | Worker<TData, void> = null;

	private workerOptions: null | QueueWorkerOptions;

	public constructor({
		logger,
		name,
		processor,
		workerOptions,
	}: Constructor<TData>) {
		this.logger = logger;
		this.name = name;
		this.processor = processor;
		this.workerOptions = workerOptions ?? null;
	}

	protected async addJob(data: TData, options: JobsOptions): Promise<void> {
		if (!this.queue) {
			throw new Error(QueueErrorMessage.QUEUE_NOT_CREATED);
		}

		await this.queue.add(this.name, data, options);
	}

	protected async addRepeatableJob(
		data: TData,
		repeatOptions: RepeatOptions,
		jobOptions: JobsOptions,
	): Promise<void> {
		if (!this.queue) {
			throw new Error(QueueErrorMessage.QUEUE_NOT_CREATED);
		}

		await this.queue.upsertJobScheduler(
			`${this.name}-scheduler`,
			repeatOptions,
			{
				data,
				name: this.name,
				opts: jobOptions,
			},
		);
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
				...this.workerOptions,
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

	public async pauseWorkerFor(durationMs: number): Promise<void> {
		if (!this.worker || this.worker.isPaused()) {
			return;
		}

		await this.worker.pause(true);

		setTimeout(() => {
			this.worker?.resume().catch((error: unknown) => {
				this.logger.error(LoggerMessages.WORKER_RESUME_FAILED(this.name), {
					error,
				});
			});
		}, durationMs);
	}
}

export { BaseQueue };
