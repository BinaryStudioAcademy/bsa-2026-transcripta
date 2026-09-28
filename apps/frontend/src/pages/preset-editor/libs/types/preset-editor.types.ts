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

export type { GlossaryEntry, GlossaryType };
