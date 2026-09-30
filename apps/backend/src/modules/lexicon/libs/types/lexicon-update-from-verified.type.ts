import { type LexiconEntrySourceValue } from "@transcripta/shared";
import { type Transaction } from "objection";

type UpdateLexiconFromVerified = {
	documentId: number;
	minDistinctPages: number;
	outputSchema: null | Record<string, unknown>;
	pageNo: number;
	source: LexiconEntrySourceValue;
	structured: null | Record<string, unknown> | undefined;
	text: string;
	trx: Transaction;
};

export { UpdateLexiconFromVerified };
