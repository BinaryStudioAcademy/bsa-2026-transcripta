import { EMPTY_LENGTH, INDEX_NOT_FOUND } from "@transcripta/shared";

import {
	CODE_FENCE_CLOSING_PATTERN,
	CODE_FENCE_MARKER,
	CODE_FENCE_OPENING_PATTERN,
	JSON_CODE_FENCE_MARKER,
	ONE,
} from "../constants/constants.js";

const extractRawJson = (text: string): null | string => {
	const objectStart = text.indexOf("{");
	const arrayStart = text.indexOf("[");

	const candidates = [objectStart, arrayStart].filter(
		(index) => index !== INDEX_NOT_FOUND,
	);
	if (candidates.length === EMPTY_LENGTH) {
		return null;
	}

	const startIndex = Math.min(...candidates);
	const closingChar = text[startIndex] === "{" ? "}" : "]";
	const endIndex = text.lastIndexOf(closingChar);

	if (endIndex <= startIndex) {
		return null;
	}

	const candidate = text.slice(startIndex, endIndex + ONE);

	try {
		JSON.parse(candidate);
		return candidate;
	} catch {
		return null;
	}
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
