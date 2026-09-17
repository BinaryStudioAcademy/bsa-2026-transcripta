import { INDEX_NOT_FOUND } from "@transcripta/shared";

import {
	CODE_FENCE_CLOSING_PATTERN,
	CODE_FENCE_MARKER,
	CODE_FENCE_OPENING_PATTERN,
	JSON_CODE_FENCE_MARKER,
} from "../constants/constants.js";

const extractJsonCodeFence = (text: string): null | string => {
	const normalizedText = text.toLowerCase();
	const openingIndex = normalizedText.indexOf(JSON_CODE_FENCE_MARKER);

	if (openingIndex === INDEX_NOT_FOUND) {
		return null;
	}

	const contentStart = openingIndex + JSON_CODE_FENCE_MARKER.length;
	const closingIndex = text.indexOf(CODE_FENCE_MARKER, contentStart);

	if (closingIndex === INDEX_NOT_FOUND) {
		return null;
	}

	return text.slice(contentStart, closingIndex).trim();
};

const stripCodeFence = (text: string): string => {
	const trimmed = text.trim();

	if (trimmed.startsWith(CODE_FENCE_MARKER)) {
		return trimmed
			.replace(CODE_FENCE_OPENING_PATTERN, "")
			.replace(CODE_FENCE_CLOSING_PATTERN, "")
			.trim();
	}

	const jsonBlock = extractJsonCodeFence(trimmed);

	return jsonBlock ?? trimmed;
};

export { stripCodeFence };
