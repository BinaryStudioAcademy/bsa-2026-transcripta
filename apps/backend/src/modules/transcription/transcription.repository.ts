import { PageStatus } from "@transcripta/shared";
import { type Transaction } from "objection";

import { DatabaseTableName } from "~/libs/modules/database/database.js";

import { EMPTY_LENGTH } from "./libs/constants/constants.js";
import {
	type CreateManualTranscriptionPayload,
	type TranscriptionDebugRow,
	type UnreviewedTranscriptionRow,
} from "./libs/types/types.js";
import { TranscriptionModel } from "./transcription.model.js";

const MANUAL_TRANSCRIPTION_ZERO_COST_USD = "0";

class TranscriptionRepository {
	private transcriptionModel: typeof TranscriptionModel;

	public constructor(transcriptionModel: typeof TranscriptionModel) {
		this.transcriptionModel = transcriptionModel;
	}

	public async createManual(
		payload: CreateManualTranscriptionPayload,
		trx?: Transaction,
	): Promise<TranscriptionModel> {
		return await this.transcriptionModel.query(trx).insertAndFetch({
			contextUsed: {},
			costUsd: MANUAL_TRANSCRIPTION_ZERO_COST_USD,
			documentId: payload.documentId,
			editedStructured: null,
			editedText: null,
			fromCache: false,
			inputTokens: EMPTY_LENGTH,
			isCurrent: true,
			latencyMs: EMPTY_LENGTH,
			model: null,
			outputTokens: EMPTY_LENGTH,
			pageId: payload.pageId,
			presetId: payload.presetId,
			prompt: "",
			provider: null,
			rawResponse: "",
			structured: null,
			text: payload.text,
		});
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

	// Model output nobody has checked yet: the current transcription of every
	// page still waiting for review, apart from the one being verified.
	public async findCurrentOfUnreviewedPages(
		documentId: number,
		exceptPageId: number,
		trx?: Transaction,
	): Promise<UnreviewedTranscriptionRow[]> {
		return await this.transcriptionModel
			.query(trx)
			.alias("t")
			.select("t.id", "t.text", "t.structured")
			.join(`${DatabaseTableName.PAGE} as p`, "p.id", "t.pageId")
			.where("t.documentId", documentId)
			.where("t.isCurrent", true)
			.where("p.status", PageStatus.TRANSCRIBED)
			.whereNot("p.id", exceptPageId)
			.castTo<UnreviewedTranscriptionRow[]>();
	}

	public async updateEditedStructuredIfActual({
		editedStructured,
		id,
		jobCreatedAt,
		trx,
	}: {
		editedStructured: null | Record<string, unknown>;
		id: number;
		jobCreatedAt: string;
		trx?: Transaction;
	}): Promise<boolean> {
		const updatedRows = await this.transcriptionModel
			.query(trx)
			.patch({
				editedStructured,
				rederiveStructuredJobCreatedAt: jobCreatedAt,
			})
			.where({ id })
			.andWhere((builder) => {
				builder
					.whereNull("rederiveStructuredJobCreatedAt")
					.orWhere("rederiveStructuredJobCreatedAt", "<=", jobCreatedAt);
			})
			.execute();

		return updatedRows > EMPTY_LENGTH;
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

	// Rewrites the model output in place, keeping the row and its id, so a page
	// the reader already has open stays the one they will verify.
	public async updateModelOutput(
		id: number,
		{
			structured,
			text,
		}: Pick<UnreviewedTranscriptionRow, "structured" | "text">,
		trx?: Transaction,
	): Promise<void> {
		await this.transcriptionModel
			.query(trx)
			.patch({ structured, text })
			.where({ id })
			.execute();
	}
}

export { TranscriptionRepository };
