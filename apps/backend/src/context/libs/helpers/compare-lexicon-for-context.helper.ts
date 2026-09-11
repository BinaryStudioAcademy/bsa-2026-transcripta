import { type LexiconContextSortable } from "../types/types.js";

const COMPARE_A_BEFORE_B = -1;
const COMPARE_EQUAL = 0;
const COMPARE_A_AFTER_B = 1;

const compareLexiconForContext = (
	left: LexiconContextSortable,
	right: LexiconContextSortable,
): number => {
	if (left.distinctPages !== right.distinctPages) {
		return right.distinctPages - left.distinctPages;
	}

	if (left.freq !== right.freq) {
		return right.freq - left.freq;
	}

	if (left.valueDisplay < right.valueDisplay) {
		return COMPARE_A_BEFORE_B;
	}

	if (left.valueDisplay > right.valueDisplay) {
		return COMPARE_A_AFTER_B;
	}

	return COMPARE_EQUAL;
};

export { compareLexiconForContext };
