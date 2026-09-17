import { Redis } from "ioredis";

import { config } from "~/libs/modules/config/config.js";
import { logger } from "~/libs/modules/logger/logger.js";
import { storage } from "~/libs/modules/storage/storage.js";
import { DocumentModel } from "~/modules/documents/document.model.js";
import { DocumentRepository } from "~/modules/documents/document.repository.js";
import { createTranscribeHandler } from "~/modules/jobs/jobs.js";
import { TRANSCRIBE_RETRY_DELAY_MS } from "~/modules/jobs/libs/constants/constants.js";
import { transcriptionService } from "~/modules/transcription/transcription.js";

import { documentCleanupQueue } from "./document-cleanup/document-cleanup.js";
import { REDIS_CONNECT_TIMEOUT_MS } from "./libs/constants/constants.js";
import { type PageTranscribeJobData } from "./libs/types/types.js";
import { PageTranscribeQueue } from "./page-transcribe-queue.module.js";
import { QueueRegistry } from "./queue-registry.module.js";

const redis = new Redis(config.ENV.REDIS.URL, {
	connectTimeout: REDIS_CONNECT_TIMEOUT_MS,
	enableOfflineQueue: false,
	lazyConnect: true,
	maxRetriesPerRequest: null,
	retryStrategy: () => null,
});

let pageTranscribeQueue: PageTranscribeQueue;

const enqueueRetry = async (data: PageTranscribeJobData): Promise<void> => {
	await pageTranscribeQueue.add(data, {
		delay: TRANSCRIBE_RETRY_DELAY_MS,
	});
};

const documentRepository = new DocumentRepository(DocumentModel);

pageTranscribeQueue = new PageTranscribeQueue({
	logger,
	processor: createTranscribeHandler({
		config,
		documentRepository,
		enqueueRetry,
		logger,
		storage,
		transcriptionService,
	}),
});

const queueRegistry = new QueueRegistry({
	connection: redis,
	logger,
	queues: [pageTranscribeQueue, documentCleanupQueue],
});

export { pageTranscribeQueue, queueRegistry };
export {
	DocumentCleanupQueue,
	documentCleanupQueue,
} from "./document-cleanup/document-cleanup.js";
