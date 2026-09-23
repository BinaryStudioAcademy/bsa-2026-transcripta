type BasePreset = {
	description: string;
	id: string;
	name: string;
};

type GlossaryEntry = {
	id: string;
	kind: GlossaryType;
	value: string;
};

type GlossaryType =
	| "abbreviation"
	| "formula"
	| "other"
	| "person name"
	| "place"
	| "surname"
	| "term";

type PresetEditorFormValues = {
	description: string;
	instructions: string;
	name: string;
	seedGlossary: GlossaryEntry[];
};

export type {
	BasePreset,
	GlossaryEntry,
	GlossaryType,
	/** @public */ PresetEditorFormValues,
};
