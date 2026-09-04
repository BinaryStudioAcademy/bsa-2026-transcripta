import { logger } from "~/libs/modules/logger/logger.js";
import { storage } from "~/libs/modules/storage/storage.js";
import { pageRepository } from "~/modules/pages/pages.js";

import { DocumentController } from "./document.controller.js";
import { DocumentModel } from "./document.model.js";
import { DocumentRepository } from "./document.repository.js";
import { DocumentService } from "./document.service.js";

const documentRepository = new DocumentRepository(DocumentModel);
const documentService = new DocumentService(
	documentRepository,
	pageRepository,
	storage,
);
const documentController = new DocumentController(logger, documentService);

export { documentController };
