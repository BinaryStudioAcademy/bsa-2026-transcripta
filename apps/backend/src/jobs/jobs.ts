import { config } from "~/libs/modules/config/config.js";
import { database } from "~/libs/modules/database/database.js";
import { logger } from "~/libs/modules/logger/logger.js";
import { transcribeQueue } from "~/libs/modules/queue/queue.js";
import { storage } from "~/libs/modules/storage/storage.js";
import { transcriptionService } from "~/modules/transcription/transcription.js";

import { createTranscribeHandler } from "./transcribe.js";

/**
 * Connects the database (required by every model) and starts consuming
 * `page.transcribe` jobs. BullMQ `attempts: 1` means a thrown or failed job is
 * not retried automatically — a page only records `last_error` and an attempt
 * counter, per TSA-53.
 */
const startWorker = (): void => {
	database.connect();

	transcribeQueue.startWorker(
		createTranscribeHandler({
			config,
			logger,
			storage,
			transcriptionService,
		}),
		{ concurrency: 1 },
	);

	logger.info("Transcribe worker started");
};

export { startWorker };
