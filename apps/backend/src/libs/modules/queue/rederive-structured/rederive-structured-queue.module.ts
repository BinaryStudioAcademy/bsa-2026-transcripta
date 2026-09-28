import { type Processor } from "bullmq";

import { type Logger } from "~/libs/modules/logger/logger.js";

import { BaseQueue } from "../base-queue.module.js";
import { QueueName } from "../libs/enums/enums.js";
import {
	BACKOFF_DELAY,
	BACKOFF_TYPE,
	JOB_ATTEMPTS,
} from "./libs/constants/constants.js";
import { type RederiveStructuredJobData } from "./libs/types/types.js";

type Constructor = {
	logger: Logger;
	processor: Processor<RederiveStructuredJobData>;
};

class RederiveStructuredQueue extends BaseQueue<RederiveStructuredJobData> {
	public constructor({ logger, processor }: Constructor) {
		super({
			logger,
			name: QueueName.REDERIVE_STRUCTURED,
			processor,
		});
	}

	public async add(data: RederiveStructuredJobData): Promise<void> {
		await this.addJob(data, {
			attempts: JOB_ATTEMPTS,
			backoff: {
				delay: BACKOFF_DELAY,
				type: BACKOFF_TYPE,
			},
		});
	}
}

export { RederiveStructuredQueue };
