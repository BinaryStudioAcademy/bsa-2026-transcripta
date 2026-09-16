type TranscriptionDebugRow = {
	contextUsed: Record<string, unknown>;
	costUsd: string;
	fromCache: boolean;
	inputTokens: number;
	latencyMs: number;
	model: null | string;
	outputTokens: number;
	pageId: number;
	presetId: null | number;
	presetVersion: null | number;
	prompt: string;
	provider: null | string;
	rawResponse: string;
	transcriptionId: number;
};

export { type TranscriptionDebugRow };
