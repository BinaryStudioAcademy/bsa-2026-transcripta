import { DocumentRepository } from "~/modules/documents/document.repository.js";
import { type TranscriptionRepository } from "~/modules/transcription/transcription.repository.js";

import { type PageEventRepository } from "../../page-event/page-event.repository.js";
import { type PageRepository } from "../../page.repository.js";

type PageServiceDependencies = {
	documentRepository: DocumentRepository;
	pageEventRepository: PageEventRepository;
	pageRepository: PageRepository;
	transcriptionRepository: TranscriptionRepository;
};

export { PageServiceDependencies };
