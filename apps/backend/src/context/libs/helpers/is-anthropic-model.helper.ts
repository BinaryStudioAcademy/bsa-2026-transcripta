import {
	ANTHROPIC_DIRECT_PREFIX,
	ANTHROPIC_ID_MARKER,
} from "../constants/constants.js";

const isAnthropicModel = (model: string): boolean => {
	return (
		model.startsWith(ANTHROPIC_DIRECT_PREFIX) ||
		model.includes(ANTHROPIC_ID_MARKER)
	);
};

export { isAnthropicModel };
