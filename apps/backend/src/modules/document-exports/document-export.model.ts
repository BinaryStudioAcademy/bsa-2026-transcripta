import {
	type DocumentExportFormatValue,
	type DocumentExportStatusValue,
} from "@transcripta/shared";

import {
	AbstractModel,
	DatabaseTableName,
} from "~/libs/modules/database/database.js";

class DocumentExportModel extends AbstractModel {
	public documentId!: number;

	public errorMessage!: null | string;

	public finishedAt!: null | string;

	public format!: DocumentExportFormatValue;

	public objectKey!: null | string;

	public requestedBy!: number;

	public sizeBytes!: null | number;

	public status!: DocumentExportStatusValue;

	public static override get tableName(): string {
		return DatabaseTableName.DOCUMENT_EXPORT;
	}
}

export { DocumentExportModel };
