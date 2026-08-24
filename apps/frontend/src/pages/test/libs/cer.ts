/**
 * Character error rate, as specified in docs/03-core-logic.md:
 * levenshtein(reference, hypothesis) / length(reference).
 *
 * Whitespace is normalised, nothing else — the product promises to preserve
 * the original orthography, so a case or spelling difference is a real error.
 */
const EMPTY_LENGTH = 0;
const STEP = 1;
const SUBSTITUTION_COST = 1;
const NO_COST = 0;

const normalize = (value: string): string =>
	value
		.split("\n")
		.map((line) => line.replaceAll(/[^\S\n]+/gu, " ").trimEnd())
		.join("\n")
		.trim();

const levenshtein = (source: string, target: string): number => {
	let previous = Array.from(
		{ length: target.length + STEP },
		(_, index) => index,
	);

	for (let row = STEP; row <= source.length; row++) {
		const current = [row];

		for (let column = STEP; column <= target.length; column++) {
			const cost =
				source[row - STEP] === target[column - STEP]
					? NO_COST
					: SUBSTITUTION_COST;

			current[column] = Math.min(
				(current[column - STEP] as number) + STEP,
				(previous[column] as number) + STEP,
				(previous[column - STEP] as number) + cost,
			);
		}

		previous = current;
	}

	return previous[target.length] as number;
};

const calculateCer = (reference: string, hypothesis: string): null | number => {
	const expected = normalize(reference);

	if (expected.length === EMPTY_LENGTH) {
		return null;
	}

	return levenshtein(expected, normalize(hypothesis)) / expected.length;
};

export { calculateCer };
