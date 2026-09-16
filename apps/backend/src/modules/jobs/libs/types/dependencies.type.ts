import { type Config } from "~/libs/modules/config/config.js";
import { type Logger } from "~/libs/modules/logger/logger.js";
import { type PageTranscribeJobData } from "~/libs/modules/queue/libs/types/types.js";
import { type BaseStorage } from "~/libs/modules/storage/base-storage.module.js";
import { type PageRepository } from "~/modules/pages/page.repository.js";
import { type TranscriptionService } from "~/modules/transcription/transcription.service.js";

type Dependencies = {
	config: Config;
	enqueuePage: (data: PageTranscribeJobData) => Promise<void>;
	logger: Logger;
	pageRepository: PageRepository;
	storage: BaseStorage;
	transcriptionService: TranscriptionService;
};

export { type Dependencies };
