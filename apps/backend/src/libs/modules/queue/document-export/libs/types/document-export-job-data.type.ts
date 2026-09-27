import { type DocumentExportFormatValue } from "@transcripta/shared";

type DocumentExportJobData = {
	documentId: number;
	exportId: number;
	format: DocumentExportFormatValue;
};

export { type DocumentExportJobData };
