import { type Transaction } from "objection";

import { DatabaseTableName } from "~/libs/modules/database/database.js";

import { type TranscriptionDebugRow } from "./libs/types/types.js";
import { TranscriptionModel } from "./transcription.model.js";

class TranscriptionRepository {
	private transcriptionModel: typeof TranscriptionModel;

	public constructor(transcriptionModel: typeof TranscriptionModel) {
		this.transcriptionModel = transcriptionModel;
	}

	public async findCurrentByPageId(
		pageId: number,
		trx?: Transaction,
	): Promise<TranscriptionModel | undefined> {
		return await this.transcriptionModel
			.query(trx)
			.where({
				isCurrent: true,
				pageId,
			})
			.first()
			.execute();
	}

	public async findCurrentDebugByPageId(
		pageId: number,
	): Promise<TranscriptionDebugRow | undefined> {
		return await this.transcriptionModel
			.knex()
			.select<TranscriptionDebugRow>([
				"t.id as transcriptionId",
				"t.pageId",
				"t.provider",
				"t.model",
				"t.presetId",
				"pr.version as presetVersion",
				"t.prompt",
				"t.rawResponse",
				"t.contextUsed",
				"t.inputTokens",
				"t.outputTokens",
				"t.costUsd",
				"t.latencyMs",
				"t.fromCache",
			])
			.from(`${DatabaseTableName.TRANSCRIPTION} as t`)
			.leftJoin(`${DatabaseTableName.PRESET} as pr`, "pr.id", "t.presetId")
			.where({
				"t.isCurrent": true,
				"t.pageId": pageId,
			})
			.first();
	}

	public async updateEditedStructured(
		id: number,
		editedStructured: null | Record<string, unknown>,
		trx?: Transaction,
	): Promise<void> {
		await this.transcriptionModel
			.query(trx)
			.patch({ editedStructured })
			.where({ id })
			.execute();
	}

	public async updateEditedText(
		id: number,
		editedText: string,
		trx?: Transaction,
	): Promise<void> {
		await this.transcriptionModel
			.query(trx)
			.patch({ editedText })
			.where({ id })
			.execute();
	}
}

export { TranscriptionRepository };
