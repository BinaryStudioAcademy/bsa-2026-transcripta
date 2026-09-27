import { type Processor } from "bullmq";

import { type Logger } from "~/libs/modules/logger/logger.js";

import { BaseQueue } from "../base-queue.module.js";
import { QueueName } from "../libs/enums/enums.js";
import { JOB_ATTEMPTS } from "./libs/constants/constants.js";
import { type DocumentExportJobData } from "./libs/types/types.js";

type Constructor = {
	logger: Logger;
	processor: Processor<DocumentExportJobData>;
};

class DocumentExportQueue extends BaseQueue<DocumentExportJobData> {
	public constructor({ logger, processor }: Constructor) {
		super({
			logger,
			name: QueueName.DOCUMENT_EXPORT,
			processor,
		});
	}

	public async add(data: DocumentExportJobData): Promise<void> {
		await this.addJob(data, {
			attempts: JOB_ATTEMPTS,
		});
	}
}

export { DocumentExportQueue };
