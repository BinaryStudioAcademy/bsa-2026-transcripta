import { type ValueOf } from "../../../../libs/types/value-of.type.js";
import { PageStatus } from "../enums/page-status.enum.js";
import { type DocumentGetPagesTranscriptionResponseDto } from "./document-get-pages-transcription-response-dto.type.js";

type DocumentGetPagesItemResponseDto = {
	id: number;
	imageUrl: null | string;
	pageNo: number;
	status: ValueOf<typeof PageStatus>;
	thumbUrl: null | string;
	transcription: DocumentGetPagesTranscriptionResponseDto | null;
};

export { type DocumentGetPagesItemResponseDto };
