import { config } from "~/libs/modules/config/config.js";
import { database } from "~/libs/modules/database/database.js";
import { logger } from "~/libs/modules/logger/logger.js";
import {
	documentCleanupQueue,
	queueRegistry,
} from "~/libs/modules/queue/queue.js";
import { authController } from "~/modules/auth/auth.js";
import { documentExportController } from "~/modules/document-exports/document-exports.js";
import { documentController } from "~/modules/documents/documents.js";
import { lexiconController } from "~/modules/lexicon/lexicon.js";
import { pageController } from "~/modules/pages/pages.js";
import { presetController } from "~/modules/presets/presets.js";
import { transcriptionController } from "~/modules/transcription/transcription.js";
import { userController } from "~/modules/users/users.js";

import { BaseServerApplicationApi } from "./base-server-application-api.js";
import { BaseServerApplication } from "./base-server-application.js";

const apiV1 = new BaseServerApplicationApi(
	"v1",
	config,
	...authController.routes,
	...documentController.routes,
	...lexiconController.routes,
	...pageController.routes,
	...presetController.routes,
	...transcriptionController.routes,
	...userController.routes,
	...documentExportController.routes,
);
const serverApplication = new BaseServerApplication({
	apis: [apiV1],
	config,
	database,
	documentCleanupQueue,
	logger,
	queueRegistry,
	title: "Transcripta",
});

export { serverApplication };
export { type ServerApplicationRouteParameters } from "./libs/types/types.js";
