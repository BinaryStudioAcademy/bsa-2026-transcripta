import { EMPTY_LENGTH } from "@transcripta/shared";

import { WORD_STEP } from "../constants/constants.js";

const segmenter = new Intl.Segmenter();

// Letters as a reader sees them, so an accented or combined letter counts once.
const toLetters = (word: string): string[] =>
	Array.from(segmenter.segment(word), ({ segment }) => segment);

// Levenshtein distance: how many letters must be added, dropped or swapped to
// turn one word into the other.
const countEdits = (from: string, to: string): number => {
	const toList = toLetters(to);
	let previous = Array.from(
		{ length: toList.length + WORD_STEP },
		(_, index) => index,
	);

	for (const [row, fromLetter] of toLetters(from).entries()) {
		const current = [row + WORD_STEP];

		for (const [column, toLetter] of toList.entries()) {
			const substitution =
				(previous[column] as number) +
				(fromLetter === toLetter ? EMPTY_LENGTH : WORD_STEP);
			const deletion = (previous[column + WORD_STEP] as number) + WORD_STEP;
			const insertion = (current[column] as number) + WORD_STEP;

			current.push(Math.min(substitution, deletion, insertion));
		}

		previous = current;
	}

	return previous[toList.length] as number;
};

export { countEdits };
