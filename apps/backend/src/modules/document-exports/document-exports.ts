import { logger } from "~/libs/modules/logger/logger.js";
import { storage } from "~/libs/modules/storage/storage.js";

import { DocumentExportController } from "./document-export.controller.js";
import { DocumentExportModel } from "./document-export.model.js";
import { DocumentExportRepository } from "./document-export.repository.js";
import { DocumentExportService } from "./document-export.service.js";

const documentExportRepository = new DocumentExportRepository(
	DocumentExportModel,
);
const documentExportService = new DocumentExportService({
	documentExportRepository,
	storage,
});
const documentExportController = new DocumentExportController(
	logger,
	documentExportService,
);

export { documentExportController };
