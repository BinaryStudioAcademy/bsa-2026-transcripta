import { MILLION, ModelIdValue } from "@transcripta/shared";

import {
	COST_USD_FRACTION_DIGITS,
	MODEL_RATES,
} from "../constants/constants.js";

const calculateTokenCost = ({
	inputTokens,
	modelId,
	outputTokens,
}: {
	inputTokens: number;
	modelId: ModelIdValue;
	outputTokens: number;
}): string => {
	const result =
		(inputTokens / MILLION) * MODEL_RATES[modelId].inputUsdPerMillion +
		(outputTokens / MILLION) * MODEL_RATES[modelId].outputUsdPerMillion;
	return result.toFixed(COST_USD_FRACTION_DIGITS);
};

export { calculateTokenCost };
