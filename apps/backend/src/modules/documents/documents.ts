import { logger } from "~/libs/modules/logger/logger.js";
import { pdfPageProcessor } from "~/libs/modules/pdf-page-processor/pdf-page-processor.js";
import { documentExportQueue } from "~/libs/modules/queue/document-export/document-export.js";
import { pageTranscribeQueue } from "~/libs/modules/queue/queue.js";
import { storage } from "~/libs/modules/storage/storage.js";
import { pageRepository } from "~/modules/pages/pages.js";

import { DocumentExportModel } from "../document-exports/document-export.model.js";
import { DocumentExportRepository } from "../document-exports/document-export.repository.js";
import { DocumentController } from "./document.controller.js";
import { DocumentModel } from "./document.model.js";
import { DocumentRepository } from "./document.repository.js";
import { DocumentService } from "./document.service.js";

const documentExportRepository = new DocumentExportRepository(
	DocumentExportModel,
);
const documentRepository = new DocumentRepository(DocumentModel);
const documentService = new DocumentService({
	documentExportQueue,
	documentExportRepository,
	documentRepository,
	pageRepository,
	pageTranscribeQueue,
	pdfPageProcessor,
	storage,
});
const documentController = new DocumentController(logger, documentService);

export { documentController };
