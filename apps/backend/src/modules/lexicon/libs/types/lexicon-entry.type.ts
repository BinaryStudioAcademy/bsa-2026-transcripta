import {
	type LexiconEntryKindValue,
	type LexiconEntrySourceValue,
} from "@transcripta/shared";

type LexiconEntryType = {
	createdAt: string;
	distinctPages: number;
	documentId: number;
	firstPageNo: number;
	id: number;
	invalidatedAt: null | string;
	invalidReason: null | string;
	kind: LexiconEntryKindValue;
	lastPageNo: number;
	pageCount: number;
	source: LexiconEntrySourceValue;
	updatedAt: string;
	valueDisplay: string;
	valueNormalized: string;
};

export { LexiconEntryType };
