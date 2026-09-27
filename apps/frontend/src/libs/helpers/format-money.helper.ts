import { CURRENCY_DECIMAL_PLACES } from "../constants/constants.js";

const formatMoney = (value: number | string): string =>
	`$${Number(value).toFixed(CURRENCY_DECIMAL_PLACES)}`;

export { formatMoney };
