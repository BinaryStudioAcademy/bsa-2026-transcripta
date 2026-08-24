/**
 * Character error rate, as specified in docs/03-core-logic.md:
 * levenshtein(reference, hypothesis) / length(reference).
 *
 * Whitespace is normalised, nothing else — the product promises to preserve
 * the original orthography, so a case or spelling difference is a real error.
 */
const normalize = (value: string): string =>
	value
		.split("\n")
		.map((line) => line.replaceAll(/[^\S\n]+/gu, " ").trimEnd())
		.join("\n")
		.trim();

const levenshtein = (source: string, target: string): number => {
	let previous = Array.from({ length: target.length + 1 }, (_, index) => index);

	for (let row = 1; row <= source.length; row++) {
		const current = [row];

		for (let column = 1; column <= target.length; column++) {
			const cost = source[row - 1] === target[column - 1] ? 0 : 1;

			current[column] = Math.min(
				(current[column - 1] as number) + 1,
				(previous[column] as number) + 1,
				(previous[column - 1] as number) + cost,
			);
		}

		previous = current;
	}

	return previous[target.length] as number;
};

const calculateCer = (reference: string, hypothesis: string): null | number => {
	const expected = normalize(reference);

	if (expected.length === 0) {
		return null;
	}

	return levenshtein(expected, normalize(hypothesis)) / expected.length;
};

export { calculateCer };
