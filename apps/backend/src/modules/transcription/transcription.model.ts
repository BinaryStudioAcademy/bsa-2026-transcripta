import {
	AbstractModel,
	DatabaseTableName,
} from "~/libs/modules/database/database.js";

class TranscriptionModel extends AbstractModel {
	public contextUsed!: Record<string, unknown>;

	public documentId!: number;

	public editedStructured!: null | Record<string, unknown>;

	public editedText!: null | string;

	public fromCache!: boolean;

	public inputTokens!: number;

	public isCurrent!: boolean;

	public latencyMs!: number;

	public model!: null | string;

	public outputTokens!: number;

	public pageId!: number;

	public presetId!: null | number;

	public provider!: null | string;

	public structured!: null | Record<string, unknown>;

	public text!: string;

	public static override get tableName(): string {
		return DatabaseTableName.TRANSCRIPTION;
	}
}

export { TranscriptionModel };
