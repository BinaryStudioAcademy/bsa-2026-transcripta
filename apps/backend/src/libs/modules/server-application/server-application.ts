import { config } from "~/libs/modules/config/config.js";
import { database } from "~/libs/modules/database/database.js";
import { logger } from "~/libs/modules/logger/logger.js";
import { queueRegistry } from "~/libs/modules/queue/queue.js";
import { authController } from "~/modules/auth/auth.js";
import { documentController } from "~/modules/documents/documents.js";
import { pageController } from "~/modules/pages/pages.js";
import { transcriptionController } from "~/modules/transcription/transcription.js";
import { userController } from "~/modules/users/users.js";

import { BaseServerApplicationApi } from "./base-server-application-api.js";
import { BaseServerApplication } from "./base-server-application.js";

const apiV1 = new BaseServerApplicationApi(
	"v1",
	config,
	...authController.routes,
	...documentController.routes,
	...transcriptionController.routes,
	...userController.routes,
	...pageController.routes,
);
const serverApplication = new BaseServerApplication({
	apis: [apiV1],
	config,
	database,
	logger,
	queueRegistry,
	title: "Transcripta",
});

export { serverApplication };
export { type ServerApplicationRouteParameters } from "./libs/types/types.js";
