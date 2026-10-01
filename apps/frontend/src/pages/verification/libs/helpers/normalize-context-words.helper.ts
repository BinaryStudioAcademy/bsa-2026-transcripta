import { EMPTY_LENGTH } from "~/libs/constants/common.constants.js";

import { WORD_CHARACTER_PATTERN } from "../constants/constants.js";
import {
	type ContextWord,
	type NormalizeContextWordsPayload,
} from "../types/types.js";

const CHARACTER_STEP = 1;

const isWordCharacter = (character: string | undefined): boolean =>
	character !== undefined && WORD_CHARACTER_PATTERN.test(character);

const isWholeWord = (text: string, { end, start }: ContextWord): boolean =>
	!isWordCharacter(text[start - CHARACTER_STEP]) && !isWordCharacter(text[end]);

const isValidRange = (text: string, contextWord: ContextWord): boolean => {
	const { end, start, word } = contextWord;

	return (
		Number.isInteger(start) &&
		Number.isInteger(end) &&
		start >= EMPTY_LENGTH &&
		start < end &&
		end <= text.length &&
		text.slice(start, end) === word &&
		isWholeWord(text, contextWord)
	);
};

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
