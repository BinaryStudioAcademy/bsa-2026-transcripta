import { LexiconEntryKind } from "@transcripta/shared";

type GlossaryEntry = {
	id: string;
	kind: GlossaryType;
	note?: string;
	value: string;
};

type GlossaryType = (typeof LexiconEntryKind)[keyof typeof LexiconEntryKind];

export type { GlossaryEntry, GlossaryType };
