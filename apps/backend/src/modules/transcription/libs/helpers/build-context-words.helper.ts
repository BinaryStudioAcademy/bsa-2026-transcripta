import {
	type DocumentGetPagesContextWordResponseDto,
	EMPTY_LENGTH,
} from "@transcripta/shared";

import {
	NOT_FOUND_INDEX,
	WORD_CHARACTER_PATTERN,
} from "../constants/constants.js";
import { type BuildContextWordsPayload } from "../types/types.js";

const CHARACTER_STEP = 1;

const isWordCharacter = (character: string | undefined): boolean =>
	character !== undefined && WORD_CHARACTER_PATTERN.test(character);

// A lexicon word counts only as a complete word: "Ann" matches in
// "Ann Annabelle (Ann).", but not inside "Annabelle". Punctuation next to the
// word does not break the match.
const isWholeWord = (text: string, start: number, end: number): boolean =>
	!isWordCharacter(text[start - CHARACTER_STEP]) && !isWordCharacter(text[end]);

const buildContextWords = ({
	lexiconById,
	text,
}: BuildContextWordsPayload): DocumentGetPagesContextWordResponseDto[] => {
	const contextWords: DocumentGetPagesContextWordResponseDto[] = [];

	for (const [lexiconId, lexicon] of lexiconById) {
		const { valueDisplay } = lexicon;

		if (valueDisplay.length === EMPTY_LENGTH) {
			continue;
		}

		let searchFrom = 0;

		while (searchFrom <= text.length) {
			const start = text.indexOf(valueDisplay, searchFrom);

			if (start === NOT_FOUND_INDEX) {
				break;
			}

			const end = start + valueDisplay.length;

			if (!isWholeWord(text, start, end)) {
				searchFrom = start + CHARACTER_STEP;

				continue;
			}

			contextWords.push({
				end,
				lexiconId,
				seenOnPages: lexicon.distinctPages,
				start,
				word: valueDisplay,
			});

			searchFrom = end;
		}
	}

	return contextWords;
};

export { buildContextWords };
