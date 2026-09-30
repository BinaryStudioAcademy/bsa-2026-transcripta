import { logger } from "~/libs/modules/logger/logger.js";
import { storage } from "~/libs/modules/storage/storage.js";
import { DocumentModel } from "~/modules/documents/document.model.js";
import { DocumentRepository } from "~/modules/documents/document.repository.js";

import { DocumentExportController } from "./document-export.controller.js";
import { DocumentExportModel } from "./document-export.model.js";
import { DocumentExportRepository } from "./document-export.repository.js";
import { DocumentExportService } from "./document-export.service.js";

const documentExportRepository = new DocumentExportRepository(
	DocumentExportModel,
);
const documentRepository = new DocumentRepository(DocumentModel);
const documentExportService = new DocumentExportService({
	documentExportRepository,
	documentRepository,
	storage,
});
const documentExportController = new DocumentExportController(
	logger,
	documentExportService,
);

export { documentExportController };
