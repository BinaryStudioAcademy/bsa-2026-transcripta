import { createTranscribeHandler } from "~/modules/jobs/jobs.js";
import { TRANSCRIBE_RETRY_DELAY_MS } from "~/modules/jobs/libs/constants/constants.js";

import { type PageTranscribeQueueOptions } from "./libs/types/types.js";
import { PageTranscribeQueue } from "./page-transcribe-queue.module.js";

const createPageTranscribeQueue = ({
	config,
	documentRepository,
	logger,
	pageRepository,
	storage,
	transcriptionService,
}: PageTranscribeQueueOptions): PageTranscribeQueue => {
	let queue: PageTranscribeQueue;

	queue = new PageTranscribeQueue({
		logger,
		processor: createTranscribeHandler({
			config,
			documentRepository,
			enqueuePage: (data): Promise<void> => queue.add(data),
			enqueueRetry: (data) =>
				queue.add(data, {
					delay: TRANSCRIBE_RETRY_DELAY_MS,
				}),
			logger,
			pageRepository,
			pauseWorkerFor: (delayMs: number) => queue.pauseWorkerFor(delayMs),
			storage,
			transcriptionService,
		}),
		workerOptions: {
			concurrency: config.ENV.QUEUE.PAGE_TRANSCRIBE_CONCURRENCY,
		},
	});
	return queue;
};

export { createPageTranscribeQueue };
