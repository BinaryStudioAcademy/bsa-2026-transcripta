import {
	type DocumentExportFormatValue,
	type DocumentExportStatusValue,
} from "@transcripta/shared";

type DocumentExportRawItem = {
	createdAt: string;
	format: DocumentExportFormatValue;
	id: number;
	objectKey: null | string;
	sizeBytes: null | number;
	status: DocumentExportStatusValue;
};

export { type DocumentExportRawItem };
