import { PageStatusValue } from "@transcripta/shared";

import {
	AbstractModel,
	DatabaseTableName,
} from "~/libs/modules/database/database.js";

class PageModel extends AbstractModel {
	public attempts!: number;

	public documentId!: number;

	public imageKey!: null | string;

	public imageSha256!: null | string;

	public lastError!: null | string;

	public pageNo!: number;

	public status!: PageStatusValue;

	public thumbKey!: null | string;

	public verifiedAt!: null | string;

	public verifiedBy!: null | number;

	public static override get tableName(): string {
		return DatabaseTableName.PAGE;
	}
}

export { PageModel };
