type GlossaryEntry = {
	id: string;
	kind: GlossaryType;
	note?: string;
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
