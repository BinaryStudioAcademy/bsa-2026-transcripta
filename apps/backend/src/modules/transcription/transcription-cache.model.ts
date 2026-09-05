import { Model } from "objection";

import { DatabaseTableName } from "~/libs/modules/database/database.js";

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
