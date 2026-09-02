import {
	AbstractModel,
	DatabaseTableName,
} from "~/libs/modules/database/database.js";

class LexiconEntryModel extends AbstractModel {
	public distinctPages!: number;

	public documentId!: number;

	public firstPageNo!: number;

	public freq!: number;

	public invalidatedAt!: null | string;

	public invalidReason!: null | string;

	public kind!: string;

	public lastPageNo!: number;

	public valueDisplay!: string;

	public valueNormalized!: string;

	public static override get tableName(): string {
		return DatabaseTableName.LEXICON_ENTRY;
	}
}

export { LexiconEntryModel };
