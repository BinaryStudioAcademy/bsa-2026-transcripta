import {
	type DocumentGetPagesContextWordResponseDto,
	EMPTY_LENGTH,
} from "@transcripta/shared";

import { NOT_FOUND_INDEX } from "../constants/constants.js";
import { type BuildContextWordsPayload } from "../types/types.js";

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

			contextWords.push({
				end: start + valueDisplay.length,
				lexiconId,
				seenOnPages: lexicon.distinctPages,
				start,
				word: valueDisplay,
			});

			searchFrom = start + valueDisplay.length;
		}
	}

	return contextWords;
};

export { buildContextWords };
