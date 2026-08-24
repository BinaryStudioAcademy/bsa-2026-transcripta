type TranscriptionResponse = {
	latencyMs: number;
	modelId: string;
	text: string;
	usage: {
		inputTokens: number;
		outputTokens: number;
	};
};

export { type TranscriptionResponse };
