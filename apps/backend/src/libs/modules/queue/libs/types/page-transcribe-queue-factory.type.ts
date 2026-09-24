import { type config } from "~/libs/modules/config/config.js";
import { type Logger } from "~/libs/modules/logger/logger.js";
import { type storage } from "~/libs/modules/storage/storage.js";
import { type DocumentRepository } from "~/modules/documents/document.repository.js";
import { type PageRepository } from "~/modules/pages/page.repository.js";
import { type TranscriptionService } from "~/modules/transcription/transcription.service.js";

type PageTranscribeQueueOptions = {
	config: typeof config;
	documentRepository: DocumentRepository;
	logger: Logger;
	pageRepository: PageRepository;
	storage: typeof storage;
	transcriptionService: TranscriptionService;
};

export { PageTranscribeQueueOptions };
