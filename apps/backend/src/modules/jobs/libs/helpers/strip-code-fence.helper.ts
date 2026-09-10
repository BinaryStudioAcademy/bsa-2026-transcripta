import {
	CODE_FENCE_CLOSING_PATTERN,
	CODE_FENCE_MARKER,
	CODE_FENCE_OPENING_PATTERN,
} from "../constants/constants.js";

const stripCodeFence = (text: string): string => {
	const trimmed = text.trim();

	if (!trimmed.startsWith(CODE_FENCE_MARKER)) {
		return trimmed;
	}

	return trimmed
		.replace(CODE_FENCE_OPENING_PATTERN, "")
		.replace(CODE_FENCE_CLOSING_PATTERN, "")
		.trim();
};

export { stripCodeFence };
