import { config } from "~/libs/modules/config/config.js";
import { logger } from "~/libs/modules/logger/logger.js";
import { secrets } from "~/libs/modules/secrets/secrets.js";

import { TranscriptionController } from "./transcription.controller.js";
import { TranscriptionService } from "./transcription.service.js";

const transcriptionService = new TranscriptionService(config, secrets);
const transcriptionController = new TranscriptionController(
	logger,
	transcriptionService,
);

export { transcriptionController };
