import { EMPTY_LENGTH } from "~/libs/constants/common.constants.js";

import {
	type ContextWord,
	type NormalizeContextWordsPayload,
} from "../types/types.js";

const isValidRange = (
	text: string,
	{ end, start, word }: ContextWord,
): boolean =>
	Number.isInteger(start) &&
	Number.isInteger(end) &&
	start >= EMPTY_LENGTH &&
	start < end &&
	end <= text.length &&
	text.slice(start, end) === word;

const normalizeContextWords = ({
	contextWords,
	text,
}: NormalizeContextWordsPayload): ContextWord[] => {
	const sorted = contextWords
		.filter((contextWord) => isValidRange(text, contextWord))
		.toSorted((a, b) => a.start - b.start || b.end - a.end);

	const accepted: ContextWord[] = [];
	let lastEnd = EMPTY_LENGTH;

	for (const contextWord of sorted) {
		if (contextWord.start < lastEnd) {
			continue;
		}

		accepted.push(contextWord);
		lastEnd = contextWord.end;
	}

	return accepted;
};

export { normalizeContextWords };
