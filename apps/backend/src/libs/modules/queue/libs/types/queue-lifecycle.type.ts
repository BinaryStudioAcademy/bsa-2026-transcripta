import { type Queue } from "bullmq";
import { type Redis } from "ioredis";

type QueueLifecycle = {
	close(): Promise<void>;
	connect(connection: Redis): Promise<void>;
	getQueue(): null | Queue;
};

export { QueueLifecycle };
