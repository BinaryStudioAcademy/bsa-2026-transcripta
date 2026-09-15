import { type Processor } from "bullmq";

import { type Logger } from "~/libs/modules/logger/logger.js";

import { BaseQueue } from "../base-queue.module.js";
import { QueueName } from "../libs/enums/enums.js";
import {
	DOCUMENT_CLEANUP_JOB_ATTEMPTS,
	ONE_HOUR_IN_MS,
} from "./libs/constants/constants.js";

type Constructor = {
	logger: Logger;
	processor: Processor<null>;
};

class DocumentCleanupQueue extends BaseQueue<null> {
	public constructor({ logger, processor }: Constructor) {
		super({
			logger,
			name: QueueName.DOCUMENT_CLEANUP,
			processor,
		});
	}

	public async init(): Promise<void> {
		await this.addRepeatableJob(
			null,
			{
				every: ONE_HOUR_IN_MS,
			},
			{
				attempts: DOCUMENT_CLEANUP_JOB_ATTEMPTS,
			},
		);
	}
}

export { DocumentCleanupQueue };
