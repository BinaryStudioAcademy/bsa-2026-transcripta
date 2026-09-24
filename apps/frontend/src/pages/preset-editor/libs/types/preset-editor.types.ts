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
	GlossaryEntry,
	GlossaryType,
	/** @public */ PresetEditorFormValues,
};
