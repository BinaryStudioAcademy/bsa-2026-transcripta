import { logger } from "~/libs/modules/logger/logger.js";
import { storage } from "~/libs/modules/storage/storage.js";
import { DocumentExportModel } from "~/modules/document-exports/document-export.model.js";
import { DocumentExportRepository } from "~/modules/document-exports/document-export.repository.js";
import { DocumentModel } from "~/modules/documents/document.model.js";
import { DocumentRepository } from "~/modules/documents/document.repository.js";
import { createDocumentExportHandler } from "~/modules/jobs/jobs.js";
import { PageModel } from "~/modules/pages/page.model.js";
import { PageRepository } from "~/modules/pages/page.repository.js";

import { DocumentExportQueue } from "./document-export-queue.module.js";

const documentRepository = new DocumentRepository(DocumentModel);
const documentExportRepository = new DocumentExportRepository(
	DocumentExportModel,
);
const pageRepository = new PageRepository(PageModel);

const documentExportQueue = new DocumentExportQueue({
	logger,
	processor: createDocumentExportHandler({
		documentExportRepository,
		documentRepository,
		logger,
		pageRepository,
		storage,
	}),
});

export { type DocumentExportJobData } from "./libs/types/types.js";
export { documentExportQueue };
