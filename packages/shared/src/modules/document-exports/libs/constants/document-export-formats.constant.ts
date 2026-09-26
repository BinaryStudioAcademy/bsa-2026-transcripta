import { DocumentExportFormat } from "../enums/enums.js";

const DOCUMENT_EXPORT_FORMATS = [
	DocumentExportFormat.CSV,
	DocumentExportFormat.JSON,
	DocumentExportFormat.TXT,
] as const;

export { DOCUMENT_EXPORT_FORMATS };
