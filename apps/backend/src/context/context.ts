import { logger } from "~/libs/modules/logger/logger.js";
import { secrets } from "~/libs/modules/secrets/secrets.js";

import { EstimateTokens } from "./estimate-tokens.module.js";
import { type EstimateTokensResult } from "./libs/types/types.js";

const estimateTokensService = new EstimateTokens(secrets, logger);

const estimateTokens = async (
	blocks: string[],
	model: string,
): Promise<EstimateTokensResult> => {
	return await estimateTokensService.estimate(blocks, model);
};

export { estimateTokens };
export { EstimateTokens } from "./estimate-tokens.module.js";
export { CONTEXT_BUDGET_SAFETY_MARGIN } from "./libs/constants/constants.js";
export { getEffectiveContextBudget } from "./libs/helpers/helpers.js";
export { type EstimateTokensResult } from "./libs/types/types.js";
