type Preset = {
	id: number;
	instructions: null | string;
	outputSchema: null | Record<string, unknown>;
	seedGlossary: Array<Record<string, unknown>> | null | string[];
	settings: null | Record<string, unknown>;
};

export { type Preset };
