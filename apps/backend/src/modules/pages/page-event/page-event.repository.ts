import { type PageVerificationActionValue } from "@transcripta/shared";
import { type Transaction } from "objection";

import { type PageEventModel } from "./page-event.model.js";

type CreatePageEventPayload = {
	actorId: number;
	documentId: number;
	durationMs: number;
	event: PageVerificationActionValue;
	pageId: number;
	transcriptionId: number;
};

type FindVerificationEventPayload = {
	event: PageVerificationActionValue;
	pageId: number;
	transcriptionId: number;
};

class PageEventRepository {
	private pageEventModel: typeof PageEventModel;

	public constructor(pageEventModel: typeof PageEventModel) {
		this.pageEventModel = pageEventModel;
	}

	public async createVerificationEvent(
		payload: CreatePageEventPayload,
		trx?: Transaction,
	): Promise<void> {
		await this.pageEventModel
			.query(trx)
			.insert({
				...payload,
				details: {},
			})
			.execute();
	}

	public async findVerificationEvent(
		payload: FindVerificationEventPayload,
		trx?: Transaction,
	): Promise<PageEventModel | undefined> {
		return await this.pageEventModel
			.query(trx)
			.where(payload)
			.first()
			.execute();
	}
}

export { PageEventRepository };
