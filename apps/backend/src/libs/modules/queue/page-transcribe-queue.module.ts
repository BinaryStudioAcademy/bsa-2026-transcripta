import { type Processor } from "bullmq";

import { type Logger } from "~/libs/modules/logger/logger.js";

import { BaseQueue } from "./base-queue.module.js";
import { PAGE_TRANSCRIBE_JOB_ATTEMPTS } from "./libs/constants/constants.js";
import { QueueName } from "./libs/enums/enums.js";
import { type PageTranscribeJobData } from "./libs/types/types.js";

type Constructor = {
	logger: Logger;
	processor: Processor<PageTranscribeJobData>;
};

class PageTranscribeQueue extends BaseQueue<PageTranscribeJobData> {
	public constructor({ logger, processor }: Constructor) {
		super({
			logger,
			name: QueueName.PAGE_TRANSCRIBE,
			processor,
		});
	}

	public async add(
		data: PageTranscribeJobData,
		options?: { delay?: number },
	): Promise<void> {
		await this.addJob(data, {
			attempts: PAGE_TRANSCRIBE_JOB_ATTEMPTS,
			delay: options?.delay,
		});
	}
}

export { PageTranscribeQueue };
