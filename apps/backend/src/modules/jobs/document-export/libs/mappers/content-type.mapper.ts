import { DocumentExportFormat } from "../enums/enums.js";
import { type DocumentExportFormatValue } from "../types/types.js";

const ContentType: Record<DocumentExportFormatValue, string> = {
	[DocumentExportFormat.CSV]: "text/csv; charset=utf-8",
	[DocumentExportFormat.JSON]: "application/json; charset=utf-8",
	[DocumentExportFormat.TXT]: "text/plain; charset=utf-8",
} as const;

export { ContentType };
