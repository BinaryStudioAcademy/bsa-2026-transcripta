import { CONTEXT_BUDGET_SAFETY_MARGIN } from "../constants/constants.js";

const getEffectiveContextBudget = (maxContextTokens: number): number => {
	return Math.floor(maxContextTokens * CONTEXT_BUDGET_SAFETY_MARGIN);
};

export { getEffectiveContextBudget };
