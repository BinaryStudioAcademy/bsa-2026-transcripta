import { logger } from "~/libs/modules/logger/logger.js";

import { DocumentController } from "./document.controller.js";
import { DocumentModel } from "./document.model.js";
import { DocumentRepository } from "./document.repository.js";
import { DocumentService } from "./document.service.js";

const documentRepository = new DocumentRepository(DocumentModel);
const documentService = new DocumentService(documentRepository);
const documentController = new DocumentController(logger, documentService);

export { documentController };
