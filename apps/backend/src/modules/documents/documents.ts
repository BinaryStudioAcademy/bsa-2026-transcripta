import { logger } from "~/libs/modules/logger/logger.js";
import { pdfPageProcessor } from "~/libs/modules/pdf-page-processor/pdf-page-processor.js";
import { storage } from "~/libs/modules/storage/storage.js";

import { pageRepository } from "../pages/pages.js";
import { DocumentController } from "./document.controller.js";
import { DocumentModel } from "./document.model.js";
import { DocumentRepository } from "./document.repository.js";
import { DocumentService } from "./document.service.js";

const documentRepository = new DocumentRepository(DocumentModel);
const documentService = new DocumentService({
	documentRepository,
	pageRepository,
	pdfPageProcessor,
	storage,
});
const documentController = new DocumentController(logger, documentService);

export { documentController };
