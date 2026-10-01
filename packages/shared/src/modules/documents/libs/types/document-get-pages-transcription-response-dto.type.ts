import { type DocumentGetPagesContextWordResponseDto } from "./document-get-pages-context-word-response-dto.type.js";

type DocumentGetPagesTranscriptionResponseDto = {
	contextWords: DocumentGetPagesContextWordResponseDto[];
	id: number;
	// The estimated cost of the model call this transcription avoided, or
	// `"0.000000"` when the model was called normally. The cache is shared
	// across accounts, so the amount is the only thing ever exposed about it.
	savedUsd: string;
	structured: null | Record<string, unknown>;
	text: string;
};

export { type DocumentGetPagesTranscriptionResponseDto };
