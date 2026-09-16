import { type PageDebugPresetDto } from "./page-debug-preset-dto.type.js";

type PageDebugResponseDto = {
	contextUsed: Record<string, unknown>;
	costUsd: string;
	fromCache: boolean;
	inputTokens: number;
	latencyMs: number;
	model: null | string;
	outputTokens: number;
	pageId: number;
	preset: null | PageDebugPresetDto;
	prompt: string;
	provider: null | string;
	rawResponse: string;
	transcriptionId: number;
};

export { type PageDebugResponseDto };
