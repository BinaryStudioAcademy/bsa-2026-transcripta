import { PageStatus } from "./libs/enums/enums.js";
import { PageEntity } from "./page.entity.js";
import { PageModel } from "./page.model.js";

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
