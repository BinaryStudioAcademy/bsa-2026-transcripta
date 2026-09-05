import { Redis } from "ioredis";

import { config } from "~/libs/modules/config/config.js";
import { logger } from "~/libs/modules/logger/logger.js";

import { REDIS_CONNECT_TIMEOUT_MS } from "./libs/constants/constants.js";
import { PageTranscribeQueue } from "./page-transcribe-queue.module.js";
import { QueueRegistry } from "./queue-registry.module.js";

const redis = new Redis(config.ENV.REDIS.URL, {
	connectTimeout: REDIS_CONNECT_TIMEOUT_MS,
	enableOfflineQueue: false,
	lazyConnect: true,
	maxRetriesPerRequest: null,
	retryStrategy: () => null,
});

const pageTranscribeQueue = new PageTranscribeQueue({
	logger,
	processor: (job) => {
		logger.info("Page transcription job picked up.", job.data);

		return Promise.resolve();
	},
});
const queueRegistry = new QueueRegistry({
	connection: redis,
	logger,
	queues: [pageTranscribeQueue],
});

export { queueRegistry };
