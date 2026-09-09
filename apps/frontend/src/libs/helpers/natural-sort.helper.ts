import { NATURAL_SORT_EQUAL, NATURAL_SORT_GREATER, NATURAL_SORT_LESS } from "~/libs/constants/sort.constants.js";

type SortPart = {
	key: string;
	numericValue: null | number;
};

const toParts = (value: string): SortPart[] => {
	const matches = value.match(/\d+|\D+/g) ?? [];

	return matches.map((part): SortPart => {
		const numericValue = Number(part);
		const isNumeric = Number.isInteger(numericValue);

		return {
			key: part,
			numericValue: isNumeric ? numericValue : null,
		};
	});
};

const compareParts = (first: SortPart, second: SortPart): number => {
	if (first.numericValue !== null && second.numericValue !== null) {
		if (first.numericValue < second.numericValue) {
			return NATURAL_SORT_LESS;
		}

		if (first.numericValue > second.numericValue) {
			return NATURAL_SORT_GREATER;
		}

		return NATURAL_SORT_EQUAL;
	}

	if (first.numericValue !== null) {
		return NATURAL_SORT_LESS;
	}

	if (second.numericValue !== null) {
		return NATURAL_SORT_GREATER;
	}

	if (first.key < second.key) {
		return NATURAL_SORT_LESS;
	}

	if (first.key > second.key) {
		return NATURAL_SORT_GREATER;
	}

	return NATURAL_SORT_EQUAL;
};

const naturalSort = (left: string, right: string): number => {
	const leftParts = toParts(left);
	const rightParts = toParts(right);

	const length = Math.max(leftParts.length, rightParts.length);

	for (let index = 0; index < length; index++) {
		const leftPart = leftParts[index] ?? {
			key: "",
			numericValue: null,
		};
		const rightPart = rightParts[index] ?? {
			key: "",
			numericValue: null,
		};
		const comparison = compareParts(leftPart, rightPart);

		if (comparison !== NATURAL_SORT_EQUAL) {
			return comparison;
		}
	}

	return NATURAL_SORT_EQUAL;
};

export { naturalSort };