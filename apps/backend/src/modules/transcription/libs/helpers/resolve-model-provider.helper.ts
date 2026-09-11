import {
	AMAZON_ID_MARKER,
	ANTHROPIC_DIRECT_PREFIX,
} from "../constants/constants.js";
import { ModelProvider } from "../enums/enums.js";
import { type ModelProviderValue } from "../types/types.js";

const resolveModelProvider = (modelId: string): ModelProviderValue => {
	if (modelId.startsWith(ANTHROPIC_DIRECT_PREFIX)) {
		return ModelProvider.ANTHROPIC_DIRECT;
	}

	if (modelId.includes(AMAZON_ID_MARKER) || modelId === ModelProvider.AMAZON) {
		return ModelProvider.AMAZON;
	}

	return ModelProvider.ANTHROPIC;
};

export { resolveModelProvider };
