import { Model } from "objection";

import { DatabaseTableName } from "~/libs/modules/database/database.js";

/**
 * The one table that does not extend AbstractModel: its primary key is
 * `cache_key text`, not a numeric `id` (docs/08-template-gaps.md).
 * It deliberately has no foreign keys so it survives document deletion.
 */
class TranscriptionCacheModel extends Model {
	public cacheKey!: string;

	public costUsd!: string;

	public hitCount!: number;

	public inputTokens!: number;

	public lastHitAt!: null | string;

	public outputTokens!: number;

	public structured!: null | string;

	public text!: string;

	public static override get idColumn(): string {
		return "cache_key";
	}

	public static override get tableName(): string {
		return DatabaseTableName.TRANSCRIPTION_CACHE;
	}
}

export { TranscriptionCacheModel };
