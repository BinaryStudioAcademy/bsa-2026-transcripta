type SeedGlossaryBudgetCheckResult =
	| SeedGlossaryBudgetOk
	| SeedGlossaryBudgetRejected;

type SeedGlossaryBudgetOk = {
	ok: true;
};

type SeedGlossaryBudgetRejected = {
	ceiling: number;
	glossaryTokens: number;
	message: string;
	ok: false;
};

export { type SeedGlossaryBudgetCheckResult };
