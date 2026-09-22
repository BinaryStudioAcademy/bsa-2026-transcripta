import { SEED_GLOSSARY_BUDGET_FRACTION } from "../constants/constants.js";

const getSeedGlossaryTokenCeiling = (maxContextTokens: number): number => {
	return Math.floor(maxContextTokens * SEED_GLOSSARY_BUDGET_FRACTION);
};

export { getSeedGlossaryTokenCeiling };
