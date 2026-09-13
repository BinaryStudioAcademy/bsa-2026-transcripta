import { type FailedResolvedTranscription } from "./failed-resolved-transcription.type.js";
import { type SuccessfulResolvedTranscription } from "./successful-resolved-transcription.type.js";

type ResolvedTranscription =
	| FailedResolvedTranscription
	| SuccessfulResolvedTranscription;

export { type ResolvedTranscription };
