import { type Transaction } from "objection";

import { type TranscriptionModel } from "~/modules/transcription/transcription.model.js";

type UpdateLexiconFromVerified = {
	documentId: number;
	isCorrection: boolean;
	minDistinctPages: number;
	outputSchema: null | Record<string, unknown>;
	pageId: number;
	pageNo: number;
	transcription: TranscriptionModel;
	trx: Transaction;
};

export { UpdateLexiconFromVerified };
