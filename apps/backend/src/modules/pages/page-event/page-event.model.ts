import {
	AbstractModel,
	DatabaseTableName,
} from "~/libs/modules/database/database.js";

class PageEventModel extends AbstractModel {
	public actorId!: null | number;

	public details!: Record<string, unknown>;

	public documentId!: number;

	public durationMs!: null | number;

	public event!: string;

	public pageId!: null | number;

	public transcriptionId!: null | number;

	public static override get tableName(): string {
		return DatabaseTableName.PAGE_EVENT;
	}
}

export { PageEventModel };
