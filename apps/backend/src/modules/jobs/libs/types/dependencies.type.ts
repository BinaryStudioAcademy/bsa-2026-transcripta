import { type PageTranscribeJobData } from "~/libs/modules/queue/libs/types/types.js";
import { type DocumentRepository } from "~/modules/documents/document.repository.js";
import { type PageRepository } from "~/modules/pages/page.repository.js";

import {
	type EnqueueTranscribeRetry,
	type TranscribeDependencies,
} from "./types.js";

type Dependencies = TranscribeDependencies & {
	documentRepository: DocumentRepository;
	enqueuePage: (data: PageTranscribeJobData) => Promise<void>;
	enqueueRetry: EnqueueTranscribeRetry;
	pageRepository: PageRepository;
};

export { type Dependencies };
