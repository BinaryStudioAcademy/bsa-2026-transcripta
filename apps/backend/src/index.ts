import { AppMode } from "@transcripta/shared";

import { startWorker } from "~/jobs/jobs.js";
import { config } from "~/libs/modules/config/config.js";
import { serverApplication } from "~/libs/modules/server-application/server-application.js";

const mode = config.ENV.APP.MODE;

// Worker mode starts no HTTP server - it only consumes the queue.
if (mode === AppMode.WORKER) {
	startWorker();
} else {
	await serverApplication.init();

	if (mode === AppMode.ALL) {
		startWorker();
	}
}
