import {
	ANTHROPIC_DIRECT_PREFIX,
	ANTHROPIC_MODEL_MARKER,
} from "../constants/constants.js";

const isAnthropicModel = (model: string): boolean => {
	return (
		model.startsWith(ANTHROPIC_DIRECT_PREFIX) ||
		model.includes(ANTHROPIC_MODEL_MARKER)
	);
};

export { isAnthropicModel };
