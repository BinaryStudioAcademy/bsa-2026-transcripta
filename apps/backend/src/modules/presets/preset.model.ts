import {
	AbstractModel,
	DatabaseTableName,
} from "~/libs/modules/database/database.js";

class PresetModel extends AbstractModel {
	public description!: string;

	public familyId!: number;

	public instructions!: string;

	public isPublic!: boolean;

	public name!: string;

	public outputSchema!: Record<string, unknown>;

	public ownerId!: null | number;

	public seedGlossary!: Record<string, unknown>[] | string[];

	public settings!: {
		blankStdevThreshold?: number;
		lexiconTopK?: number;
		maxContextTokens?: number;
		minDistinctPages?: number;
		model?: string;
		neighbourPages?: number;
	};

	public version!: number;

	public static override get jsonAttributes(): string[] {
		return ["seedGlossary"];
	}

	public static override get tableName(): string {
		return DatabaseTableName.PRESET;
	}
}

export { PresetModel };
