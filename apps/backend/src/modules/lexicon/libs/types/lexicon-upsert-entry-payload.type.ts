import { type LexiconEntryKindValue } from "@transcripta/shared";

type UpsertLexiconEntryPayload = {
	documentId: number;
	kind: LexiconEntryKindValue;
	pageNo: number;
	valueDisplay: string;
	valueNormalized: string;
};

export { UpsertLexiconEntryPayload };
