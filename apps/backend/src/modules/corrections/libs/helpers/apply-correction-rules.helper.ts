import {
	LETTER_PATTERN,
	LETTERS_PER_ALLOWED_EDIT,
	MIN_ALLOWED_EDITS,
	MIN_LETTERS_IN_RULE,
	UNSURE_MARKS_PATTERN,
	WORD_PATTERN,
} from "../constants/constants.js";
import { type CorrectionRule } from "../types/types.js";
import { countEdits } from "./count-edits.helper.js";

const escapeForPattern = (value: string): string =>
	value.replaceAll(/[.*+?^${}()|[\]\\]/gu, String.raw`\$&`);

const applyExactRules = (text: string, rules: CorrectionRule[]): string => {
	let result = text;

	for (const { corrected, misread } of rules) {
		const pattern = new RegExp(
			String.raw`(?<![\p{L}\p{N}])${escapeForPattern(misread)}(?:\(\?\)|\[\?\]|\?)?(?![\p{L}\p{N}])`,
			"gu",
		);

		result = result.replaceAll(pattern, corrected);
	}

	return result;
};

const findClosestReading = (
	word: string,
	readings: string[],
): null | string => {
	const allowedEdits = Math.max(
		MIN_ALLOWED_EDITS,
		Math.floor(word.length / LETTERS_PER_ALLOWED_EDIT),
	);
	const scored = readings
		.map((reading) => ({
			edits: countEdits(word.toLowerCase(), reading.toLowerCase()),
			reading,
		}))
		.filter(({ edits }) => edits <= allowedEdits)
		.toSorted((first, second) => first.edits - second.edits);

	const [best, runnerUp] = scored;

	// Two settled readings equally close: the word could be either family, so
	// it is left for the reader to decide.
	if (!best || (runnerUp && runnerUp.edits === best.edits)) {
		return null;
	}

	return best.reading;
};

// The model marks a word it could not make out, and each new page can misread
// it a little differently ("Kaamenko(?)", then "Kovamenko(?)"). Such a word
// takes the closest reading the reader has already settled. A word the model
// is sure of is never touched, so a real "Kovalenko" is not merged into a
// neighbouring "Kovarnenko".
const applyToUnsureWords = (text: string, readings: string[]): string =>
	text.replaceAll(WORD_PATTERN, (token) => {
		const bare = token.replaceAll(UNSURE_MARKS_PATTERN, "");
		const isUnsure = bare !== token;
		const letters = [...bare.matchAll(LETTER_PATTERN)].length;

		if (!isUnsure || letters < MIN_LETTERS_IN_RULE) {
			return token;
		}

		return findClosestReading(bare, readings) ?? token;
	});

// Reapplies what the reader already fixed on another page. The lexicon only
// suggests a word to the model; this makes the reader's own reading win.
// A rule is keyed on the bare word, so the plain and the unsure spelling
// ("Kaamenko", "Kaamenko(?)") are both replaced, mark included.
const applyCorrectionRules = (
	text: string,
	rules: CorrectionRule[],
): string => {
	const readings = [...new Set(rules.map(({ corrected }) => corrected))];

	return applyToUnsureWords(applyExactRules(text, rules), readings);
};

export { applyCorrectionRules };
