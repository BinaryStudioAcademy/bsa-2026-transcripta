import { LexiconEntryKind } from "@transcripta/shared";

type GlossaryEntry = {
	id: string;
	kind: GlossaryType;
	note?: string;
	value: string;
};

type GlossaryType = (typeof LexiconEntryKind)[keyof typeof LexiconEntryKind];

type PresetFormState = {
	basePresetId: null | number;
	description: string;
	entries: GlossaryEntry[];
	instructions: string;
	name: string;
};

export type { GlossaryEntry, GlossaryType, PresetFormState };
