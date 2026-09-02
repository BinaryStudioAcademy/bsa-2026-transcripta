import { type Processor } from "bullmq";

import { type Logger } from "../logger/logger.js";
import { BaseQueue } from "./base-queue.module.js";
import {
	PAGE_TRANSCRIBE_JOB_ATTEMPTS,
	PAGE_TRANSCRIBE_QUEUE_NAME,
} from "./libs/constants/constants.js";
import { type PageTranscribeJobData } from "./libs/types/types.js";

type Constructor = {
	logger: Logger;
	processor: Processor<PageTranscribeJobData>;
};

class PageTranscribeQueue extends BaseQueue<PageTranscribeJobData> {
	public constructor({ logger, processor }: Constructor) {
		super({
			logger,
			name: PAGE_TRANSCRIBE_QUEUE_NAME,
			processor,
		});
	}

	public async add(data: PageTranscribeJobData): Promise<void> {
		await this.addJob(data, { attempts: PAGE_TRANSCRIBE_JOB_ATTEMPTS });
	}
}

export { PageTranscribeQueue };
