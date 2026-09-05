import {
	Queue as BullQueue,
	Worker as BullWorker,
	type Job,
	type JobsOptions,
	type WorkerOptions,
} from "bullmq";
import { Redis as IORedis, type Redis } from "ioredis";

import { type Config } from "~/libs/modules/config/config.js";

type QueueJobName = "page.transcribe";
type QueueJobPayload = {
	documentId: number;
	pageId: number;
	pageNo: number;
	presetId: number;
};

class BaseQueue {
	private readonly connection: Redis;

	private readonly name: QueueJobName;

	public readonly queue: BullQueue<QueueJobPayload, void, QueueJobName>;

	public worker: BullWorker<QueueJobPayload> | null = null;

	public constructor(
		config: Config,
		name: QueueJobName,
		options?: { connection: Redis },
	) {
		this.name = name;
		this.connection =
			options?.connection ??
			new IORedis(config.ENV.REDIS.URL, { maxRetriesPerRequest: null });
		this.queue = new BullQueue<QueueJobPayload, void, QueueJobName>(name, {
			connection: this.connection,
		});
	}

	public get queueName(): QueueJobName {
		return this.name;
	}

	public async add(
		payload: QueueJobPayload,
		options?: JobsOptions,
	): Promise<Job<QueueJobPayload>> {
		return await this.queue.add(this.name, payload, options);
	}

	public async close(): Promise<void> {
		await this.worker?.close();
		await this.queue.close();
		this.connection.disconnect();
	}

	public startWorker(
		handler: (job: Job<QueueJobPayload>) => Promise<void>,
		options?: { concurrency?: number },
	): void {
		const workerOptions: WorkerOptions =
			options && options.concurrency !== undefined
				? {
						concurrency: options.concurrency,
						connection: this.connection,
					}
				: { connection: this.connection };

		this.worker = new BullWorker<QueueJobPayload>(
			this.name,
			handler,
			workerOptions,
		);
	}
}

export { BaseQueue };
export { type QueueJobPayload };
