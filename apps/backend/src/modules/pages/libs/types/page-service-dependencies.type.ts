import { type PageTranscribeQueue } from "~/libs/modules/queue/page-transcribe-queue.module.js";
import { type DocumentRepository } from "~/modules/documents/document.repository.js";
import { type TranscriptionRepository } from "~/modules/transcription/transcription.repository.js";

import { type PageEventRepository } from "../../page-event/page-event.repository.js";
import { type PageRepository } from "../../page.repository.js";

type PageServiceDependencies = {
	documentRepository: DocumentRepository;
	pageEventRepository: PageEventRepository;
	pageRepository: PageRepository;
	pageTranscribeQueue: PageTranscribeQueue;
	transcriptionRepository: TranscriptionRepository;
};

export { PageServiceDependencies };
