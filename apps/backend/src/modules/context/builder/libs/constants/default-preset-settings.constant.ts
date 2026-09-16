import { config } from "~/libs/modules/config/config.js";

const DEFAULT_PRESET_SETTINGS = {
	lexiconTopK: 100,
	maxContextTokens: 6000,
	minDistinctPages: 2,
	model: config.ENV.BEDROCK.MODEL_ID,
	neighbourPages: 3,
} as const;

export { DEFAULT_PRESET_SETTINGS };
