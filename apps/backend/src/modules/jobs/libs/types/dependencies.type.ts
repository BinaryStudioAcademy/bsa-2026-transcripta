import { type Config } from "~/libs/modules/config/config.js";
import { type Logger } from "~/libs/modules/logger/logger.js";
import { type BaseStorage } from "~/libs/modules/storage/base-storage.module.js";
import { type TranscriptionService } from "~/modules/transcription/transcription.service.js";

type Dependencies = {
	config: Config;
	logger: Logger;
	storage: BaseStorage;
	transcriptionService: TranscriptionService;
};

export { type Dependencies };
