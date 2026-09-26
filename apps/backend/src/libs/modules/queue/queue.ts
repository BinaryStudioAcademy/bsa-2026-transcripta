import { Redis } from "ioredis";

import { config } from "~/libs/modules/config/config.js";
import { logger } from "~/libs/modules/logger/logger.js";
import { DocumentModel } from "~/modules/documents/document.model.js";
import { DocumentRepository } from "~/modules/documents/document.repository.js";
import { PageModel } from "~/modules/pages/page.model.js";
import { PageRepository } from "~/modules/pages/page.repository.js";
import { transcriptionService } from "~/modules/transcription/transcription.js";

import { storage } from "../storage/storage.js";
import { documentCleanupQueue } from "./document-cleanup/document-cleanup.js";
import { documentExportQueue } from "./document-export/document-export.js";
import { REDIS_CONNECT_TIMEOUT_MS } from "./libs/constants/constants.js";
import { createPageTranscribeQueue } from "./page-transcribe-queue-factory.js";
import { QueueRegistry } from "./queue-registry.module.js";
import { rederiveStructuredQueue } from "./rederive-structured/rederive-structured.js";

const redis = new Redis(config.ENV.REDIS.URL, {
	connectTimeout: REDIS_CONNECT_TIMEOUT_MS,
	enableOfflineQueue: false,
	lazyConnect: true,
	maxRetriesPerRequest: null,
	retryStrategy: () => null,
});

const pageTranscribeQueue = createPageTranscribeQueue({
	config,
	documentRepository: new DocumentRepository(DocumentModel),
	logger,
	pageRepository: new PageRepository(PageModel),
	storage,
	transcriptionService,
});

const queueRegistry = new QueueRegistry({
	connection: redis,
	logger,
	queues: [
		pageTranscribeQueue,
		documentCleanupQueue,
		rederiveStructuredQueue,
		documentExportQueue,
	],
});

export { pageTranscribeQueue, queueRegistry };
export {
	DocumentCleanupQueue,
	documentCleanupQueue,
} from "./document-cleanup/document-cleanup.js";
export { type DocumentExportJobData } from "./document-export/document-export.js";
export {
	RederiveStructuredQueue,
	rederiveStructuredQueue,
} from "./rederive-structured/rederive-structured.js";
export { type RederiveStructuredJobData } from "./rederive-structured/rederive-structured.js";
