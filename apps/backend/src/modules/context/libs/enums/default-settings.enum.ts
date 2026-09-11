import { type ContextSettings } from "../types/types.js";

const DEFAULT_SETTINGS: ContextSettings = {
	lexiconTopK: 100,
	maxContextTokens: 6000,
	minDistinctPages: 2,
	neighbourPages: 3,
};

export { DEFAULT_SETTINGS };
