import { type Logger } from "~/libs/modules/logger/logger.js";
import { type PageTranscribeQueue } from "~/libs/modules/queue/page-transcribe-queue.module.js";
import { RederiveStructuredQueue } from "~/libs/modules/queue/queue.js";
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
	rederiveStructuredQueue: RederiveStructuredQueue;
	transcriptionRepository: TranscriptionRepository;
	transcriptionService: TranscriptionService;
};

export { PageServiceDependencies };
