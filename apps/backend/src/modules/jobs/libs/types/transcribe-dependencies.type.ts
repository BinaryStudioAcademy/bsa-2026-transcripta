import { type Config } from "~/libs/modules/config/config.js";
import { type Logger } from "~/libs/modules/logger/logger.js";
import { type BaseStorage } from "~/libs/modules/storage/base-storage.module.js";
import { type DocumentRepository } from "~/modules/documents/document.repository.js";
import { type TranscriptionService } from "~/modules/transcription/transcription.service.js";

type TranscribeDependencies = {
	config: Config;
	documentRepository: DocumentRepository;
	logger: Logger;
	storage: BaseStorage;
	transcriptionService: TranscriptionService;
};

export { type TranscribeDependencies };
