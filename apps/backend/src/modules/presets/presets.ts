import { logger } from "~/libs/modules/logger/logger.js";

import { PresetController } from "./preset.controller.js";
import { PresetModel } from "./preset.model.js";
import { PresetRepository } from "./preset.repository.js";
import { PresetService } from "./preset.service.js";

const presetRepository = new PresetRepository(PresetModel);
const presetService = new PresetService(presetRepository);
const presetController = new PresetController(logger, presetService);

export { presetController, presetService };
export { PresetModel } from "./preset.model.js";
