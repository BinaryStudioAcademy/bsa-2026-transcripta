import { type Logger } from "~/libs/modules/logger/logger.js";
import { type PageTranscribeQueue } from "~/libs/modules/queue/page-transcribe-queue.module.js";
import { type DocumentRepository } from "~/modules/documents/document.repository.js";
import { type TranscriptionRepository } from "~/modules/transcription/transcription.repository.js";
import { TranscriptionService } from "~/modules/transcription/transcription.service.js";

import { type PageEventRepository } from "../../page-event/page-event.repository.js";
import { type PageRepository } from "../../page.repository.js";

type PageServiceDependencies = {
	documentRepository: DocumentRepository;
	logger: Logger;
	pageEventRepository: PageEventRepository;
	pageRepository: PageRepository;
	pageTranscribeQueue: PageTranscribeQueue;
	transcriptionRepository: TranscriptionRepository;
	transcriptionService: TranscriptionService;
};

export { PageServiceDependencies };
