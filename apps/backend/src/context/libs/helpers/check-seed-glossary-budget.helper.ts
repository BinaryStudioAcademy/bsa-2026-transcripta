import { type SeedGlossaryBudgetCheckResult } from "../types/types.js";
import { getSeedGlossaryTokenCeiling } from "./get-seed-glossary-token-ceiling.helper.js";

const checkSeedGlossaryBudget = (
	glossaryTokens: number,
	maxContextTokens: number,
): SeedGlossaryBudgetCheckResult => {
	const ceiling = getSeedGlossaryTokenCeiling(maxContextTokens);

	if (glossaryTokens > ceiling) {
		return {
			ceiling,
			glossaryTokens,
			message: `The seed glossary comes to ${glossaryTokens.toString()} tokens, the ceiling is ${ceiling.toString()}`,
			ok: false,
		};
	}

	return { ok: true };
};

export { checkSeedGlossaryBudget };
