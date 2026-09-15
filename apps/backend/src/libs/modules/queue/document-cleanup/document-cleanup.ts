import { logger } from "~/libs/modules/logger/logger.js";
import { storage } from "~/libs/modules/storage/storage.js";
import { DocumentModel } from "~/modules/documents/document.model.js";
import { DocumentRepository } from "~/modules/documents/document.repository.js";
import { createDraftCleanupHandler } from "~/modules/jobs/jobs.js";

import { DocumentCleanupQueue } from "./document-cleanup-queue.module.js";

const documentRepository = new DocumentRepository(DocumentModel);

const documentCleanupQueue = new DocumentCleanupQueue({
	logger,
	processor: createDraftCleanupHandler({
		documentRepository,
		logger,
		storage,
	}),
});

export { documentCleanupQueue };
export { DocumentCleanupQueue } from "./document-cleanup-queue.module.js";
