import { type Logger } from "~/libs/modules/logger/logger.js";
import { type PageTranscribeJobData } from "~/libs/modules/queue/libs/types/page-transcribe-job-data.type.js";
import { type DocumentRepository } from "~/modules/documents/document.repository.js";

import { type EnqueueTranscribeRetry } from "./enqueue-transcribe-retry.type.js";
import { type FailedResolvedTranscription } from "./types.js";

type HandleFailedTranscriptionPayload = {
	contextUsed: string;
	documentId: number;
	documentRepository: DocumentRepository;
	enqueueRetry: EnqueueTranscribeRetry;
	jobData: PageTranscribeJobData;
	logger: Logger;
	modelId: string;
	pageAttempts: number;
	pageId: number;
	presetId: number;
	resolved: FailedResolvedTranscription;
};

export { HandleFailedTranscriptionPayload };
