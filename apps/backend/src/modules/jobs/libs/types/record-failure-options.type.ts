import { type Dependencies } from "./dependencies.type.js";
import { type TranscribeFailureReasonValue } from "./transcribe-failure-reason-value.type.js";

type RecordFailureOptions = Pick<
	Dependencies,
	"enqueuePage" | "pageRepository"
> & {
	costUsd?: number;
	documentId: number;
	event?: {
		details: Record<string, unknown>;
		durationMs: number;
	};
	pageId: number;
	reason: TranscribeFailureReasonValue;
};

export { type RecordFailureOptions };
