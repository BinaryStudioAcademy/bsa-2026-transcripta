import { DatabaseTableName } from "~/libs/modules/database/database.js";

import { PageStatus } from "./libs/enums/enums.js";
import { type PageWithTranscriptionRow } from "./libs/types/types.js";
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
}

export { PageRepository };
