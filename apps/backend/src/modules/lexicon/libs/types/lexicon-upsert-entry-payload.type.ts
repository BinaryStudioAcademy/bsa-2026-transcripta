import {
	type LexiconEntryKindValue,
	type LexiconEntrySourceValue,
} from "@transcripta/shared";

type UpsertLexiconEntryPayload = {
	documentId: number;
	kind: LexiconEntryKindValue;
	pageNo: number;
	source: LexiconEntrySourceValue;
	valueDisplay: string;
	valueNormalized: string;
};

export { UpsertLexiconEntryPayload };
