const MONEY_DECIMAL_PLACES = 2;

const formatMoney = (value: string): string =>
	`$${Number(value).toFixed(MONEY_DECIMAL_PLACES)}`;

export { formatMoney };
