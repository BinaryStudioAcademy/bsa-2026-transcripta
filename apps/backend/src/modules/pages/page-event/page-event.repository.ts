import { type Transaction } from "objection";

import { PageEventName } from "~/modules/jobs/libs/enums/enums.js";

const INITIAL_PAGE_EVENT_ATTEMPT = 0;

import {
	type CreatePageEventPayload,
	type CreateUndoPageEventPayload,
	type FindVerificationEventPayload,
} from "./libs/types/types.js";
import { type PageEventModel } from "./page-event.model.js";

class PageEventRepository {
	private pageEventModel: typeof PageEventModel;

	public constructor(pageEventModel: typeof PageEventModel) {
		this.pageEventModel = pageEventModel;
	}

	public async createUndoEvent(
		payload: CreateUndoPageEventPayload,
		trx?: Transaction,
	): Promise<void> {
		await this.pageEventModel
			.query(trx)
			.insert({
				...payload,
				details: {},
				event: PageEventName.UNDO,
			})
			.execute();
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

	public async findLatestAttempt(
		pageId: number,
		trx?: Transaction,
	): Promise<number> {
		const event = await this.pageEventModel
			.query(trx)
			.where({ pageId })
			.orderBy("attempt", "desc")
			.first()
			.execute();

		return event?.attempt ?? INITIAL_PAGE_EVENT_ATTEMPT;
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
