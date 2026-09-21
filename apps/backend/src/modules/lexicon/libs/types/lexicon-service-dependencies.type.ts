import { type PageTranscribeQueue } from "~/libs/modules/queue/page-transcribe-queue.module.js";

import { type LexiconRepository } from "../../lexicon.repository.js";

type LexiconServiceDependencies = {
	lexiconRepository: LexiconRepository;
	pageTranscribeQueue: PageTranscribeQueue;
};

export { type LexiconServiceDependencies };
