import {
	AbstractModel,
	DatabaseTableName,
} from "~/libs/modules/database/database.js";

class CorrectionRuleModel extends AbstractModel {
	public corrected!: string;

	public documentId!: number;

	public misread!: string;

	public misreadNormalized!: string;

	public static override get tableName(): string {
		return DatabaseTableName.CORRECTION_RULE;
	}
}

export { CorrectionRuleModel };
