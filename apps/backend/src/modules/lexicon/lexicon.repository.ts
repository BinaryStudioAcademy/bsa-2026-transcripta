import { EMPTY_LENGTH, PageStatus } from "@transcripta/shared";
import { type Transaction } from "objection";

import { DatabaseTableName } from "~/libs/modules/database/database.js";
import { LexiconEntryModel } from "~/modules/documents/lexicon-entry.model.js";
import { PageEventModel } from "~/modules/pages/page-event/page-event.model.js";
import { PageModel } from "~/modules/pages/page.model.js";

import { LexiconPageEventName } from "./libs/enums/enums.js";
import {
	type AffectedPageRow,
	type OwnedLexiconEntry,
} from "./libs/types/types.js";

class LexiconRepository {
	private lexiconEntryModel: typeof LexiconEntryModel;

	public constructor(lexiconEntryModel: typeof LexiconEntryModel) {
		this.lexiconEntryModel = lexiconEntryModel;
	}

	public async findAffectedPagesByLexiconId(
		documentId: number,
		lexiconId: number,
		trx?: Transaction,
	): Promise<AffectedPageRow[]> {
		return await PageModel.query(trx)
			.alias("p")
			.select(
				"p.id",
				"p.documentId",
				"p.pageNo",
				"p.status",
				"t.id as transcriptionId",
			)
			.join(`${DatabaseTableName.TRANSCRIPTION} as t`, (builder) => {
				builder.on("t.pageId", "p.id").andOnVal("t.isCurrent", true);
			})
			.where("p.documentId", documentId)
			.whereIn("p.status", [
				PageStatus.CONFIRMED,
				PageStatus.CORRECTED,
				PageStatus.TRANSCRIBED,
			])
			.whereRaw("t.context_used -> 'lexiconIds' @> to_jsonb(?::int)", [
				lexiconId,
			])
			.castTo<AffectedPageRow[]>();
	}

	public async findOwnedById(
		id: number,
		ownerId: number,
	): Promise<OwnedLexiconEntry | undefined> {
		return await this.lexiconEntryModel
			.query()
			.alias("le")
			.select("le.id", "le.documentId", "le.invalidatedAt")
			.join(`${DatabaseTableName.DOCUMENT} as d`, "d.id", "le.documentId")
			.where("le.id", id)
			.where("d.ownerId", ownerId)
			.first()
			.castTo<OwnedLexiconEntry | undefined>();
	}

	public async flagVerifiedPages(
		pages: AffectedPageRow[],
		lexiconId: number,
		trx?: Transaction,
	): Promise<number> {
		if (pages.length === EMPTY_LENGTH) {
			return EMPTY_LENGTH;
		}

		await PageEventModel.query(trx)
			.insert(
				pages.map((page) => ({
					actorId: null,
					details: { lexiconId },
					documentId: page.documentId,
					durationMs: null,
					event: LexiconPageEventName.FLAGGED_AFTER_INVALIDATE,
					pageId: page.id,
					transcriptionId: page.transcriptionId,
				})),
			)
			.execute();

		return pages.length;
	}

	public async invalidate(
		id: number,
		reason: string,
		trx?: Transaction,
	): Promise<boolean> {
		const updatedRows = await this.lexiconEntryModel
			.query(trx)
			.patch({
				invalidatedAt: new Date().toISOString(),
				invalidReason: reason,
			})
			.where({ id })
			.whereNull("invalidatedAt")
			.execute();

		return updatedRows > EMPTY_LENGTH;
	}

	public async queueTranscribedPages(
		pageIds: number[],
		trx?: Transaction,
	): Promise<number> {
		if (pageIds.length === EMPTY_LENGTH) {
			return EMPTY_LENGTH;
		}

		const updatedRows = await PageModel.query(trx)
			.patch({
				attempts: EMPTY_LENGTH,
				lastError: null,
				status: PageStatus.QUEUED,
			})
			.whereIn("id", pageIds)
			.where("status", PageStatus.TRANSCRIBED)
			.execute();

		return updatedRows;
	}

	public async restoreAfterInvalidateEnqueueFailure({
		lexiconId,
		pageIds,
	}: {
		lexiconId: number;
		pageIds: number[];
	}): Promise<void> {
		await LexiconEntryModel.transaction(async (trx) => {
			await this.lexiconEntryModel
				.query(trx)
				.patch({
					invalidatedAt: null,
					invalidReason: null,
				})
				.where({ id: lexiconId })
				.execute();

			if (pageIds.length > EMPTY_LENGTH) {
				await PageModel.query(trx)
					.patch({
						status: PageStatus.TRANSCRIBED,
					})
					.whereIn("id", pageIds)
					.where("status", PageStatus.QUEUED)
					.execute();
			}

			await PageEventModel.query(trx)
				.delete()
				.where("event", LexiconPageEventName.FLAGGED_AFTER_INVALIDATE)
				.whereRaw("details ->> 'lexiconId' = ?", [String(lexiconId)])
				.execute();
		});
	}
}

export { LexiconRepository };
