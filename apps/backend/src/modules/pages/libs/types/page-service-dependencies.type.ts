import { type Logger } from "~/libs/modules/logger/logger.js";
import { type PageTranscribeQueue } from "~/libs/modules/queue/page-transcribe-queue.module.js";
import { type RederiveStructuredQueue } from "~/libs/modules/queue/queue.js";
import { type DocumentRepository } from "~/modules/documents/document.repository.js";
import { type LexiconUpdateService } from "~/modules/lexicon/lexicon-update.service.js";
import { type PageEventRepository } from "~/modules/pages/page-event/page-event.repository.js";
import { type PageRepository } from "~/modules/pages/page.repository.js";
import { type TranscriptionRepository } from "~/modules/transcription/transcription.repository.js";

type PageServiceDependencies = {
	documentRepository: DocumentRepository;
	lexiconUpdateService: LexiconUpdateService;
	logger: Logger;
	pageEventRepository: PageEventRepository;
	pageRepository: PageRepository;
	pageTranscribeQueue: PageTranscribeQueue;
	rederiveStructuredQueue: RederiveStructuredQueue;
	transcriptionRepository: TranscriptionRepository;
};

export { type PageServiceDependencies };
