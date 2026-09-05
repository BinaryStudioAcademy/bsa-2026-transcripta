import { PageStatus, type PageStatusValue } from "@transcripta/shared";
import { type Transaction } from "objection";

import { DatabaseTableName } from "~/libs/modules/database/database.js";

import { PageEntity } from "./page.entity.js";
import { type PageModel } from "./page.model.js";

type UpdatePageVerificationPayload = {
	pageId: number;
	status: PageStatusValue;
	verifiedAt: string;
	verifiedBy: number;
};
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

	public async updateFirstPendingPagesAsQueued(
		documentId: number,
		quantity: number,
	): Promise<void> {
		const subquery = this.pageModel
			.query()
			.select("id")
			.where({ documentId, status: PageStatus.PENDING })
			.orderBy("pageNo", "asc")
			.limit(quantity);

		await this.pageModel
			.query()
			.whereIn("id", subquery)
			.patch({ status: PageStatus.QUEUED })
			.execute();
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
