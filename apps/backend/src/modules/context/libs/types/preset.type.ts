import { type SeedGlossary } from "./types.js";

type Preset = {
	id: number;
	instructions: null | string;
	outputSchema: null | Record<string, unknown>;
	seedGlossary: SeedGlossary;
	settings?: {
		blankStdevThreshold?: number;
		lexiconTopK?: number;
		maxContextTokens?: number;
		minDistinctPages?: number;
		model?: string;
		neighbourPages?: number;
	};
};

export { type Preset };
