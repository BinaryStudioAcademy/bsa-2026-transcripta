import {
	type DocumentExportFormatValue,
	type DocumentExportStatusValue,
} from "./types.js";

type DocumentExportItemResponseDto = {
	createdAt: string;
	downloadUrl: null | string;
	format: DocumentExportFormatValue;
	id: number;
	sizeBytes: null | number;
	status: DocumentExportStatusValue;
};

export { type DocumentExportItemResponseDto };
