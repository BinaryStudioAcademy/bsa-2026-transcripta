import { LexiconEntryKind } from "@transcripta/shared";

type GlossaryEntry = {
	id: string;
	kind: GlossaryType;
	note?: string;
	value: string;
};

type GlossaryType = (typeof LexiconEntryKind)[keyof typeof LexiconEntryKind];

type PresetFormErrors = {
	description: null | string;
	glossary: Record<string, string>;
	instructions: null | string;
	name: null | string;
};

export { type GlossaryEntry, type GlossaryType, type PresetFormErrors };
