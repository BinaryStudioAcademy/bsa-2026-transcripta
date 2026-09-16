import { type TranscribeFailureReasonValue } from "./transcribe-failure-reason-value.type.js";

type FailedCallOutcome = {
	inputTokens: number;
	latencyMs: number;
	ok: false;
	outputTokens: number;
	prompt: string;
	rawResponse: string;
	reason: TranscribeFailureReasonValue;
	retryable: boolean;
};

export { type FailedCallOutcome };
