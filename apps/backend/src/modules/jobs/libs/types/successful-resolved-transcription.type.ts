type SuccessfulResolvedTranscription = {
	costUsd: number;
	fromCache: boolean;
	inputTokens: number;
	latencyMs: number;
	ok: true;
	outputTokens: number;
	prompt: string;
	structured: unknown;
	text: string;
};

export { type SuccessfulResolvedTranscription };
