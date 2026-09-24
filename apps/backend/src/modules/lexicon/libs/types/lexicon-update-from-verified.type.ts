import { type Transaction } from "objection";

type UpdateLexiconFromVerified = {
	documentId: number;
	minDistinctPages: number;
	outputSchema: null | Record<string, unknown>;
	pageNo: number;
	structured: null | Record<string, unknown> | undefined;
	text: string;
	trx: Transaction;
};

export { UpdateLexiconFromVerified };
