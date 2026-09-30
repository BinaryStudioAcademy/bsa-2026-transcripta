import { config } from "~/libs/modules/config/config.js";
import { logger } from "~/libs/modules/logger/logger.js";
import { secrets } from "~/libs/modules/secrets/secrets.js";
import { DocumentModel } from "~/modules/documents/document.model.js";
import { DocumentRepository } from "~/modules/documents/document.repository.js";
import { createRederiveStructuredHandler } from "~/modules/jobs/jobs.js";
import { LexiconEntryModel } from "~/modules/lexicon/lexicon-entry.model.js";
import { LexiconUpdateService } from "~/modules/lexicon/lexicon-update.service.js";
import { LexiconRepository } from "~/modules/lexicon/lexicon.repository.js";
import { TranscriptionModel } from "~/modules/transcription/transcription.model.js";
import { TranscriptionRepository } from "~/modules/transcription/transcription.repository.js";
import { TranscriptionService } from "~/modules/transcription/transcription.service.js";

import { RederiveStructuredQueue } from "./rederive-structured-queue.module.js";

const documentRepository = new DocumentRepository(DocumentModel);
const transcriptionRepository = new TranscriptionRepository(TranscriptionModel);
const transcriptionService = new TranscriptionService(config, secrets);
const lexiconRepository = new LexiconRepository(LexiconEntryModel);
// Imported lazily: queue.ts builds the transcribe queue and imports this file,
// so a top-level import here would close the cycle.
const lexiconUpdateService = new LexiconUpdateService({
	enqueuePageTranscribe: async (payload) => {
		const { pageTranscribeQueue } = await import("../queue.js");

		await pageTranscribeQueue.add(payload);
	},
	lexiconRepository,
});

const rederiveStructuredQueue = new RederiveStructuredQueue({
	logger,
	processor: createRederiveStructuredHandler({
		documentRepository,
		lexiconUpdateService,
		logger,
		transcriptionRepository,
		transcriptionService,
	}),
});

export { rederiveStructuredQueue };
export { type RederiveStructuredJobData } from "./libs/types/types.js";
export { RederiveStructuredQueue } from "./rederive-structured-queue.module.js";
