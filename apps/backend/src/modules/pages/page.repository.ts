import { EMPTY_LENGTH, PageStatus } from "@transcripta/shared";
import { type Transaction } from "objection";

import { DatabaseTableName } from "~/libs/modules/database/database.js";
import { PAGES_TO_QUEUE } from "~/modules/documents/libs/constants/constants.js";

import {
	type PageWithTranscriptionRow,
	type UpdatePageVerificationPayload,
} from "./libs/types/types.js";
import { PageEntity } from "./page.entity.js";
import { type PageModel } from "./page.model.js";

class PageRepository {
	private pageModel: typeof PageModel;

	public constructor(pageModel: typeof PageModel) {
		this.pageModel = pageModel;
	}

	public async create(entity: PageEntity): Promise<PageEntity> {
		const page = await this.pageModel
			.query()
			.insert(entity.toNewObject())
			.returning("*")
			.execute();
		return PageEntity.initialize(page);
	}

	public async findByDocumentAndPageNo(
		documentId: number,
		pageNo: number,
		trx?: Transaction,
	): Promise<PageModel | undefined> {
		return await this.pageModel
			.query(trx)
			.where({ documentId, pageNo })
			.first()
			.execute();
	}

	public async findByDocumentId({
		documentId,
		from,
		limit,
	}: {
		documentId: number;
		from: number;
		limit: number;
	}): Promise<PageWithTranscriptionRow[]> {
		return await this.pageModel
			.knex()
			.select<PageWithTranscriptionRow[]>([
				"p.id",
				"p.pageNo",
				"p.status",
				"p.imageKey",
				"p.thumbKey",
				"t.id as transcriptionId",
				"t.text as transcriptionText",
				"t.structured as transcriptionStructured",
				"t.contextUsed as transcriptionContextUsed",
			])
			.from(`${DatabaseTableName.PAGE} as p`)
			.leftJoin(`${DatabaseTableName.TRANSCRIPTION} as t`, (builder) => {
				builder.on("t.pageId", "p.id").andOnVal("t.isCurrent", true);
			})
			.where("p.documentId", documentId)
			.andWhere("p.pageNo", ">=", from)
			.orderBy("p.pageNo", "asc")
			.limit(limit);
	}

	public async findByIdForOwner(
		pageId: number,
		ownerId: number,
		trx?: Transaction,
	): Promise<PageModel | undefined> {
		return await this.pageModel
			.query(trx)
			.alias("page")
			.join(DatabaseTableName.DOCUMENT, "document.id", "page.document_id")
			.where("page.id", pageId)
			.where("document.owner_id", ownerId)
			.select("page.*")
			.first()
			.execute();
	}

	public async findPageNumbersByDocumentId(
		documentId: number,
	): Promise<number[]> {
		const pages = await this.pageModel
			.query()
			.select("pageNo")
			.where({ documentId })
			.execute();

		return pages.map((page) => page.pageNo);
	}

	public async findQueuedPages(
		documentId: number,
		trx?: Transaction,
	): Promise<PageEntity[]> {
		const pages = await this.pageModel
			.query(trx)
			.where({ documentId })
			.where("status", PageStatus.QUEUED)
			.orderBy("page_no", "asc")
			.execute();

		return pages.map((page) => PageEntity.initialize(page));
	}

	public async resetFailedPageForReprocess(
		pageId: number,
		trx?: Transaction,
	): Promise<boolean> {
		const updatedRows = await this.pageModel
			.query(trx)
			.patch({
				attempts: EMPTY_LENGTH,
				lastError: null,
				status: PageStatus.QUEUED,
			})
			.where({
				id: pageId,
				status: PageStatus.FAILED,
			})
			.execute();

		return updatedRows > EMPTY_LENGTH;
	}

	public async restoreFailedPageAfterReprocessFailure(
		pageId: number,
		attempts: number,
		lastError: null | string,
	): Promise<void> {
		await this.pageModel
			.query()
			.patch({
				attempts,
				lastError,
				status: PageStatus.FAILED,
			})
			.where({
				attempts: EMPTY_LENGTH,
				id: pageId,
				status: PageStatus.QUEUED,
			})
			.execute();
	}

	public async updateFirstPendingPagesAsQueued(
		documentId: number,
		quantity: number,
		trx: Transaction,
	): Promise<PageEntity[]> {
		const pagesInWindow = await this.pageModel
			.query(trx)
			.where({ documentId })
			.whereIn("status", [
				PageStatus.QUEUED,
				PageStatus.TRANSCRIBING,
				PageStatus.TRANSCRIBED,
			])
			.resultSize();
		const limit = Math.min(
			quantity,
			Math.max(PAGES_TO_QUEUE - pagesInWindow, EMPTY_LENGTH),
		);

		if (limit === EMPTY_LENGTH) {
			return [];
		}

		const subquery = this.pageModel
			.query(trx)
			.select("id")
			.where({ documentId, status: PageStatus.PENDING })
			.orderBy("pageNo", "asc")
			.limit(limit);

		const pages = await this.pageModel
			.query(trx)
			.whereIn("id", subquery)
			.where({ status: PageStatus.PENDING })
			.patch({ status: PageStatus.QUEUED })
			.returning("*")
			.execute();

		return pages
			.toSorted((firstPage, secondPage) => firstPage.pageNo - secondPage.pageNo)
			.map((page) => PageEntity.initialize(page));
	}

	public async updateVerification(
		payload: UpdatePageVerificationPayload,
		trx?: Transaction,
	): Promise<void> {
		const { pageId, ...patch } = payload;

		await this.pageModel
			.query(trx)
			.patch(patch)
			.where({ id: pageId })
			.execute();
	}
}

export { PageRepository };
