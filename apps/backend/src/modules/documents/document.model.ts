import {
	AbstractModel,
	DatabaseTableName,
} from "~/libs/modules/database/database.js";

import { type DocumentStatusValue } from "./libs/types/types.js";

class DocumentModel extends AbstractModel {
	public budgetUsd!: string;

	public cursorPageNo!: number;

	public errorMessage!: null | string;

	public ownerId!: number;

	public pageCount!: number;

	public presetId!: null | number;

	public sourceBytes!: null | number;

	public sourceKey!: null | string;

	public sourceName!: null | string;

	public spentUsd!: string;

	public status!: DocumentStatusValue;

	public title!: string;

	public static override get tableName(): string {
		return DatabaseTableName.DOCUMENT;
	}
}

export { DocumentModel };
