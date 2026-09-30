import { type Processor } from "bullmq";

import { type Logger } from "~/libs/modules/logger/logger.js";

import { BaseQueue } from "./base-queue.module.js";
import {
	PAGE_TRANSCRIBE_COMPLETED_RETENTION,
	PAGE_TRANSCRIBE_FAILED_RETENTION,
	PAGE_TRANSCRIBE_JOB_ATTEMPTS,
	PAGE_TRANSCRIBE_JOB_ID_PREFIX,
} from "./libs/constants/constants.js";
import { QueueName } from "./libs/enums/enums.js";
import {
	type PageTranscribeJobData,
	type QueueWorkerOptions,
} from "./libs/types/types.js";

type Constructor = {
	logger: Logger;
	processor: Processor<PageTranscribeJobData>;
	workerOptions: QueueWorkerOptions;
};

class PageTranscribeQueue extends BaseQueue<PageTranscribeJobData> {
	public constructor({ logger, processor, workerOptions }: Constructor) {
		super({
			logger,
			name: QueueName.PAGE_TRANSCRIBE,
			processor,
			workerOptions,
		});
	}

	public async add(
		data: PageTranscribeJobData,
		options?: { delay?: number },
	): Promise<void> {
		await this.addJob(data, {
			attempts: PAGE_TRANSCRIBE_JOB_ATTEMPTS,
			jobId: `${PAGE_TRANSCRIBE_JOB_ID_PREFIX}${String(data.pageId)}`,
			removeOnComplete: PAGE_TRANSCRIBE_COMPLETED_RETENTION,
			removeOnFail: PAGE_TRANSCRIBE_FAILED_RETENTION,
			...(options?.delay === undefined ? {} : { delay: options.delay }),
		});
	}
}

export { PageTranscribeQueue };
