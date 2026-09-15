type SuccessfulResolvedTranscription = {
	costUsd: number;
	fromCache: boolean;
	inputTokens: number;
	latencyMs: number;
	ok: true;
	outputTokens: number;
	prompt: string;
	rawResponse: string;
	structured: unknown;
	text: string;
};

export { type SuccessfulResolvedTranscription };
