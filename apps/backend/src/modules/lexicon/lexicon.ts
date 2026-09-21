import { logger } from "~/libs/modules/logger/logger.js";
import { pageTranscribeQueue } from "~/libs/modules/queue/queue.js";
import { LexiconEntryModel } from "~/modules/documents/lexicon-entry.model.js";

import { LexiconController } from "./lexicon.controller.js";
import { LexiconRepository } from "./lexicon.repository.js";
import { LexiconService } from "./lexicon.service.js";

const lexiconRepository = new LexiconRepository(LexiconEntryModel);

const lexiconService = new LexiconService({
	lexiconRepository,
	pageTranscribeQueue,
});

const lexiconController = new LexiconController(logger, lexiconService);

export { lexiconController };
