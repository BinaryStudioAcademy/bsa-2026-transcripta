import { type DocumentGetPagesTranscriptionResponseDto } from "../../../documents/libs/types/document-get-pages-transcription-response-dto.type.js";
import { type PageStatusValue } from "./page-status-value.type.js";

type UndoPageResponseDto = {
	pageId: number;
	status: PageStatusValue;
	transcription: DocumentGetPagesTranscriptionResponseDto | null;
};

export { type UndoPageResponseDto };
