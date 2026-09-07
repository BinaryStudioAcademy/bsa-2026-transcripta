import { MILLION } from "@transcripta/shared";

import { type PricingRates } from "../types/types.js";

const rateForModel = (
	rates: PricingRates,
	modelId: string,
): { input: number; output: number } => {
	if (modelId.startsWith("anthropic-direct:")) {
		return rates.anthropicDirect;
	}

	if (modelId.includes(".amazon.") || modelId === "amazon") {
		return rates.amazon;
	}

	return rates.anthropic;
};

const calculateTokenCost = ({
	inputTokens,
	modelId,
	outputTokens,
	rates,
}: {
	inputTokens: number;
	modelId: string;
	outputTokens: number;
	rates: PricingRates;
}): number => {
	const rate = rateForModel(rates, modelId);

	return (
		(inputTokens / MILLION) * rate.input +
		(outputTokens / MILLION) * rate.output
	);
};

export { calculateTokenCost };
