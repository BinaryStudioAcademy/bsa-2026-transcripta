import { type Redis } from "ioredis";

type QueueLifecycle = {
	close(): Promise<void>;
	connect(connection: Redis): Promise<void>;
};

export { QueueLifecycle };
