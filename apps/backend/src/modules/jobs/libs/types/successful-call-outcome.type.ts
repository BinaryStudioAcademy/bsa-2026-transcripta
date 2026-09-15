type SuccessfulCallOutcome = {
	inputTokens: number;
	latencyMs: number;
	ok: true;
	outputTokens: number;
	rawResponse: string;
	structured: unknown;
	text: string;
};

export { type SuccessfulCallOutcome };
