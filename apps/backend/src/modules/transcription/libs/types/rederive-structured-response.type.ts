type RederiveStructuredResponse = null | {
	costUsd: number;
	inputTokens: number;
	latencyMs: number;
	outputTokens: number;
	structured: null | Record<string, unknown>;
};

export { type RederiveStructuredResponse };
