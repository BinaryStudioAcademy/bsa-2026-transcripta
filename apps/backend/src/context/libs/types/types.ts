type BuiltContext = {
	blocks: string[];
	contextHash: string;
	tokenEstimate: number;
	usedLexiconIds: number[];
	usedPageIds: number[];
};

type ContextSettings = {
	lexiconTopK: number;
	maxContextTokens: number;
	minDistinctPages: number;
	neighbourPages: number;
};

type LexiconWord = {
	distinctPages: number;
	id: number;
	valueDisplay: string;
};

type NeighbourPage = {
	id: number;
	pageNo: number;
	text: string;
};

/**
 * Nullable on purpose: every field is a nullable/jsonb column in Postgres, so
 * callers must branch on their absence instead of assuming a value (keeps the
 * `no-unnecessary-condition` checks meaningful).
 */
type Preset = {
	id: number;
	instructions: null | string;
	outputSchema: null | Record<string, unknown>;
	seedGlossary: Array<Record<string, string>> | null;
	settings: null | Record<string, unknown>;
};

export {
	type BuiltContext,
	type ContextSettings,
	type LexiconWord,
	type NeighbourPage,
	type Preset,
};
