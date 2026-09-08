import { type Transaction } from "objection";

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
