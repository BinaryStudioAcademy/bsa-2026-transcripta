import { type DocumentGetPagesContextWordResponseDto } from "./document-get-pages-context-word-response-dto.type.js";

type DocumentGetPagesTranscriptionResponseDto = {
	contextWords: DocumentGetPagesContextWordResponseDto[];
	id: number;
	structured: null | Record<string, unknown>;
	text: string;
};

export { type DocumentGetPagesTranscriptionResponseDto };
