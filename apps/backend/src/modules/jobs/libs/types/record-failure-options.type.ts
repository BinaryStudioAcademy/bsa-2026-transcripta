import { type Dependencies } from "./dependencies.type.js";
import { type TranscribeFailureReasonValue } from "./transcribe-failure-reason-value.type.js";

type RecordFailureOptions = Pick<
	Dependencies,
	"documentRepository" | "enqueuePage" | "pageRepository"
> & {
	documentId: number;
	event?: {
		details: Record<string, unknown>;
		durationMs: number;
	};
	lastError?: string;
	pageId: number;
	reason: TranscribeFailureReasonValue;
};

export { type RecordFailureOptions };
