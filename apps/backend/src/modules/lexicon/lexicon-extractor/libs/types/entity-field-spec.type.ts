import { type LexiconEntryKindValue } from "@transcripta/shared";

type EntityFieldSpec = {
	kind: LexiconEntryKindValue;
	path: string[];
};

export { type EntityFieldSpec };
