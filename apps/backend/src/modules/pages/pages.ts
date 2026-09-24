import { logger } from "~/libs/modules/logger/logger.js";
import {
	pageTranscribeQueue,
	rederiveStructuredQueue,
} from "~/libs/modules/queue/queue.js";

import { DocumentModel } from "../documents/document.model.js";
import { DocumentRepository } from "../documents/document.repository.js";
import { transcriptionService } from "../transcription/transcription.js";
import { TranscriptionModel } from "../transcription/transcription.model.js";
import { TranscriptionRepository } from "../transcription/transcription.repository.js";
import { PageEventModel } from "./page-event/page-event.model.js";
import { PageEventRepository } from "./page-event/page-event.repository.js";
import { PageController } from "./page.controller.js";
import { PageModel } from "./page.model.js";
import { PageRepository } from "./page.repository.js";
import { PageService } from "./page.service.js";

const documentRepository = new DocumentRepository(DocumentModel);
const transcriptionRepository = new TranscriptionRepository(TranscriptionModel);
const pageEventRepository = new PageEventRepository(PageEventModel);

const pageRepository = new PageRepository(PageModel);

const pageService = new PageService({
	documentRepository,
	logger,
	pageEventRepository,
	pageRepository,
	pageTranscribeQueue,
	rederiveStructuredQueue,
	transcriptionRepository,
	transcriptionService,
});

const pageController = new PageController(logger, pageService);

export { pageController, pageRepository };
export { type PageWithText } from "./libs/types/types.js";
