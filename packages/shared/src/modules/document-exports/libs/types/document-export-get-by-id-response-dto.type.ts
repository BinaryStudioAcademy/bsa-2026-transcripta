import {
	type DocumentExportFormatValue,
	type DocumentExportStatusValue,
} from "./types.js";

type DocumentExportGetByIdResponseDto = {
	createdAt: string;
	documentId: number;
	downloadUrl: null | string;
	errorMessage: null | string;
	finishedAt: null | string;
	format: DocumentExportFormatValue;
	id: number;
	sizeBytes: null | number;
	status: DocumentExportStatusValue;
};

export { type DocumentExportGetByIdResponseDto };
