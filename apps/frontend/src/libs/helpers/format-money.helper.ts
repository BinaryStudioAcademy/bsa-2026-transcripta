const FIRST_INDEX = 0;
const CURRENCY_DECIMAL_PLACES = 2;
const EMPTY_STRING = "";

const formatMoney = (value: number | string): string => {
	const stringValue = String(value);
	const [integerPart, decimalPart = EMPTY_STRING] = stringValue.split(".");
	const trimmedDecimal = decimalPart
		.slice(FIRST_INDEX, CURRENCY_DECIMAL_PLACES)
		.padEnd(CURRENCY_DECIMAL_PLACES, "0");

	return `$${integerPart ?? EMPTY_STRING}.${trimmedDecimal}`;
};

export { formatMoney };
