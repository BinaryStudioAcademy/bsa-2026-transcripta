import {
	FIRST_INDEX,
	ONE_QUANTITY,
} from "~/libs/constants/common.constants.js";

import {
	CACHE_SAVINGS_LABEL_PREFIX,
	CACHE_SAVINGS_TIP,
	SAVED_USD_DECIMALS,
} from "../constants/constants.js";
import { type CacheSavings } from "../types/types.js";

const DECIMAL_PAD = "0";
const DECIMAL_SEPARATOR = ".";
const US_DOLLAR = "$";

const trimTrailingZeros = (decimals: string): string => {
	let end = decimals.length;

	while (end > FIRST_INDEX && decimals[end - ONE_QUANTITY] === DECIMAL_PAD) {
		end -= ONE_QUANTITY;
	}

	return decimals.slice(FIRST_INDEX, end);
};

const formatUsd = (savedUsd: string): null | string => {
	const amount = Number(savedUsd);

	if (!Number.isFinite(amount) || amount <= FIRST_INDEX) {
		return null;
	}

	const [whole, fraction = ""] = amount
		.toFixed(SAVED_USD_DECIMALS)
		.split(DECIMAL_SEPARATOR);
	const decimals = trimTrailingZeros(fraction);

	if (decimals.length === FIRST_INDEX && Number(whole) === FIRST_INDEX) {
		return null;
	}

	return decimals.length > FIRST_INDEX
		? `${US_DOLLAR}${String(whole)}${DECIMAL_SEPARATOR}${decimals}`
		: `${US_DOLLAR}${String(whole)}`;
};

const getCacheSavings = (
	savedUsd: null | string | undefined,
): CacheSavings | null => {
	const amount = formatUsd(savedUsd ?? "");

	if (amount === null) {
		return null;
	}

	return {
		amount,
		prefix: CACHE_SAVINGS_LABEL_PREFIX,
		tip: CACHE_SAVINGS_TIP,
	};
};

export { getCacheSavings };
