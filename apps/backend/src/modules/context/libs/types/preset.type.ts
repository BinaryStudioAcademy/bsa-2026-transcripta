import { type SeedGlossary } from "./types.js";

type Preset = {
	id: number;
	instructions: null | string;
	outputSchema: null | Record<string, unknown>;
	seedGlossary: SeedGlossary;
	settings?: {
		lexiconTopK?: number;
		maxContextTokens?: number;
		model?: string;
		neighbourPages?: number;
	};
};

export { type Preset };
