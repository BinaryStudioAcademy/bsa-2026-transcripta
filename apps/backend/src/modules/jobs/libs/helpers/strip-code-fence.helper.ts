import { EMPTY_LENGTH, INDEX_NOT_FOUND } from "@transcripta/shared";

import {
	CODE_FENCE_CLOSING_PATTERN,
	CODE_FENCE_MARKER,
	CODE_FENCE_OPENING_PATTERN,
	JSON_CODE_FENCE_MARKER,
	ONE,
} from "../constants/constants.js";

const extractRawJson = (text: string): null | string => {
	const matches = text.matchAll(/[[{]/g);

	for (const match of matches) {
		const startIndex = match.index;
		const openingChar = match[EMPTY_LENGTH];
		const closingChar = openingChar === "{" ? "}" : "]";

		let endIndex = text.indexOf(closingChar, startIndex + ONE);

		while (endIndex !== INDEX_NOT_FOUND) {
			const candidate = text.slice(startIndex, endIndex + ONE);

			try {
				JSON.parse(candidate);

				return candidate;
			} catch {
				endIndex = text.indexOf(closingChar, endIndex + ONE);
			}
		}
	}

	return null;
};
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

	const jsonBlock = extractJsonCodeFence(trimmed);

	if (jsonBlock !== null) {
		return jsonBlock;
	}

	if (trimmed.startsWith(CODE_FENCE_MARKER)) {
		return trimmed
			.replace(CODE_FENCE_OPENING_PATTERN, "")
			.replace(CODE_FENCE_CLOSING_PATTERN, "")
			.trim();
	}

	const rawJson = extractRawJson(trimmed);

	return rawJson ?? trimmed;
};

export { stripCodeFence };
