import { MILLION } from "@transcripta/shared";

import { ModelProvider } from "../enums/enums.js";
import { type ModelRate, type PricingRates } from "../types/types.js";
import { resolveModelProvider } from "./resolve-model-provider.helper.js";

const rateForModel = (rates: PricingRates, modelId: string): ModelRate => {
	const provider = resolveModelProvider(modelId);

	if (provider === ModelProvider.ANTHROPIC_DIRECT) {
		return rates.anthropicDirect;
	}

	if (provider === ModelProvider.AMAZON) {
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
