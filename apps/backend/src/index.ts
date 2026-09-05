import { AppMode } from "@transcripta/shared";

import { config } from "~/libs/modules/config/config.js";
import { serverApplication } from "~/libs/modules/server-application/server-application.js";
import { startWorker } from "~/modules/jobs/jobs.js";

const mode = config.ENV.APP.MODE;

if (mode === AppMode.WORKER) {
	startWorker();
} else {
	await serverApplication.init();

	if (mode === AppMode.ALL) {
		startWorker();
	}
}
