const GET_BUDGET_LIMIT_ERROR_MESSAGE = (spent: string): string =>
	`New limit must be greater than current spent (${spent}).`;

export { GET_BUDGET_LIMIT_ERROR_MESSAGE };
