import { MILLION, type ModelIdValue } from "@transcripta/shared";

import { MODEL_RATES } from "../constants/constants.js";

const calculateTokenCost = ({
	inputTokens,
	modelId,
	outputTokens,
}: {
	inputTokens: number;
	modelId: ModelIdValue;
	outputTokens: number;
}): number => {
	const rate = MODEL_RATES[modelId];

	return (
		(inputTokens / MILLION) * rate.inputUsdPerMillion +
		(outputTokens / MILLION) * rate.outputUsdPerMillion
	);
};

export { calculateTokenCost };
