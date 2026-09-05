const PRICING_PER_MILLION = {
	amazon: {
		input: 0.8,
		output: 3.2,
	},
	anthropic: {
		input: 3,
		output: 15,
	},
	anthropicDirect: {
		input: 3,
		output: 15,
	},
} as const;

const rateForModel = (modelId: string): { input: number; output: number } => {
	if (modelId.startsWith("anthropic-direct:")) {
		return PRICING_PER_MILLION.anthropicDirect;
	}

	if (modelId.includes(".amazon.") || modelId === "amazon") {
		return PRICING_PER_MILLION.amazon;
	}

	return PRICING_PER_MILLION.anthropic;
};

const MILLION = 1_000_000;

const calculateTokenCost = (
	modelId: string,
	inputTokens: number,
	outputTokens: number,
): number => {
	const rate = rateForModel(modelId);

	return (
		(inputTokens / MILLION) * rate.input +
		(outputTokens / MILLION) * rate.output
	);
};

export { calculateTokenCost };
