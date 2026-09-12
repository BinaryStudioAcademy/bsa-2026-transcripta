import { type TranscribeFailureReasonValue } from "./transcribe-failure-reason-value.type.js";

type FailedResolvedTranscription = {
	costUsd: number;
	fromCache: false;
	inputTokens: number;
	latencyMs: number;
	ok: false;
	outputTokens: number;
	reason: TranscribeFailureReasonValue;
};

export { type FailedResolvedTranscription };
