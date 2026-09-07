import { type Transaction } from "objection";

import {
	type CreatePageEventPayload,
	type FindVerificationEventPayload,
} from "./libs/types/types.js";
import { type PageEventModel } from "./page-event.model.js";

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
