import { EMPTY_LENGTH } from "@transcripta/shared";

import {
	LETTER_PATTERN,
	MIN_LETTERS_IN_RULE,
	WORD_PATTERN,
	WORD_STEP,
} from "../constants/constants.js";
import { type CorrectionRuleDraft } from "../types/types.js";
import { stripUnsureMark } from "./strip-unsure-mark.helper.js";

type Hunk = { added: string[]; removed: string[] };

const toWords = (text: string): string[] =>
	[...text.matchAll(WORD_PATTERN)].map(([word]) => word);

const countLetters = (word: string): number =>
	[...word.matchAll(LETTER_PATTERN)].length;

// Numbers and short words are too common to rewrite across a document: fixing
// "March 3" to "March 8" on one record must not turn every 3 into an 8.
const isWorthARule = (misread: string, corrected: string): boolean =>
	countLetters(misread) >= MIN_LETTERS_IN_RULE &&
	countLetters(corrected) >= MIN_LETTERS_IN_RULE;

// Length of the longest common run of words from every position onwards.
const buildCommonLengths = (before: string[], after: string[]): number[][] => {
	const common = Array.from({ length: before.length + WORD_STEP }, () =>
		Array.from<number>({ length: after.length + WORD_STEP }).fill(EMPTY_LENGTH),
	);

	for (
		let row = before.length - WORD_STEP;
		row >= EMPTY_LENGTH;
		row -= WORD_STEP
	) {
		const current = common[row] as number[];
		const below = common[row + WORD_STEP] as number[];

		for (
			let column = after.length - WORD_STEP;
			column >= EMPTY_LENGTH;
			column -= WORD_STEP
		) {
			current[column] =
				before[row] === after[column]
					? (below[column + WORD_STEP] as number) + WORD_STEP
					: Math.max(
							below[column] as number,
							current[column + WORD_STEP] as number,
						);
		}
	}

	return common;
};

// Aligns the two word lists and returns the stretches that differ. Adding or
// dropping a word elsewhere on the page then leaves the other replacements
// intact instead of discarding all of them.
const findChangedHunks = (before: string[], after: string[]): Hunk[] => {
	const common = buildCommonLengths(before, after);
	const hunks: Hunk[] = [];
	let hunk: Hunk = { added: [], removed: [] };
	let row = EMPTY_LENGTH;
	let column = EMPTY_LENGTH;

	const closeHunk = (): void => {
		if (
			hunk.added.length > EMPTY_LENGTH ||
			hunk.removed.length > EMPTY_LENGTH
		) {
			hunks.push(hunk);
			hunk = { added: [], removed: [] };
		}
	};

	while (row < before.length || column < after.length) {
		const isSameWord =
			row < before.length &&
			column < after.length &&
			before[row] === after[column];

		if (isSameWord) {
			closeHunk();
			row += WORD_STEP;
			column += WORD_STEP;
			continue;
		}

		const isAddition =
			column < after.length &&
			(row === before.length ||
				(common[row]?.[column + WORD_STEP] ?? EMPTY_LENGTH) >=
					(common[row + WORD_STEP]?.[column] ?? EMPTY_LENGTH));

		if (isAddition) {
			hunk.added.push(after[column] as string);
			column += WORD_STEP;
		} else {
			hunk.removed.push(before[row] as string);
			row += WORD_STEP;
		}
	}

	closeHunk();

	return hunks;
};

// Compares what the model produced with what the reader saved and keeps the
// words they replaced one for one. A stretch where the counts differ was
// rewritten rather than corrected, so it contributes no rules.
const extractCorrectionRules = (
	original: string,
	corrected: string,
): CorrectionRuleDraft[] => {
	const rules = new Map<string, CorrectionRuleDraft>();

	for (const { added, removed } of findChangedHunks(
		toWords(original),
		toWords(corrected),
	)) {
		if (added.length !== removed.length) {
			continue;
		}

		for (const [index, misreadWord] of removed.entries()) {
			// Rules are keyed on the bare word so both the plain and the unsure
			// spelling are caught, and once a person has settled the word the
			// "(?)" doubt is not carried over into their reading.
			const misread = stripUnsureMark(misreadWord);
			const replacement = stripUnsureMark(added[index] as string);

			if (misread === replacement || !isWorthARule(misread, replacement)) {
				continue;
			}

			rules.set(misread, { corrected: replacement, misread });
		}
	}

	return [...rules.values()];
};

export { extractCorrectionRules };
