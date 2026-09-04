import { DatabaseTableName } from "~/libs/modules/database/database.js";

import { type PageWithTranscriptionRow } from "./libs/types/types.js";
import { type PageModel } from "./page.model.js";

class PageRepository {
	private pageModel: typeof PageModel;

	public constructor(pageModel: typeof PageModel) {
		this.pageModel = pageModel;
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
}

export { PageRepository };
