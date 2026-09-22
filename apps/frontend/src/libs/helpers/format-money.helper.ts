import {
	CURRENCY_DECIMAL_PLACES,
	EMPTY_STRING,
	FIRST_INDEX,
	ZERO_STRING,
} from "../constants/constants.js";

const formatMoney = (value: number | string): string => {
	const stringValue = String(value);
	const [integerPart, decimalPart = EMPTY_STRING] = stringValue.split(".");
	const trimmedDecimal = decimalPart
		.slice(FIRST_INDEX, CURRENCY_DECIMAL_PLACES)
		.padEnd(CURRENCY_DECIMAL_PLACES, ZERO_STRING);

	return `$${integerPart ?? EMPTY_STRING}.${trimmedDecimal}`;
};

export { formatMoney };
