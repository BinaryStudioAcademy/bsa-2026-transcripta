import { type TranscribeFailureReasonValue } from "./transcribe-failure-reason-value.type.js";

type FailedCallOutcome = {
	inputTokens: number;
	latencyMs: number;
	ok: false;
	outputTokens: number;
	reason: TranscribeFailureReasonValue;
};

export { type FailedCallOutcome };
