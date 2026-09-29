import { type DocumentExportFormatValue } from "../types/types.js";

const FALLBACK_FILE_NAME = "export";

const getDocumentExportFileName = (
	documentTitle: string,
	format: DocumentExportFormatValue,
): string => {
	const slug = documentTitle
		.toLowerCase()
		.split(/[^\p{L}\p{N}]+/u)
		.filter(Boolean)
		.join("-");

	return `${slug || FALLBACK_FILE_NAME}.${format}`;
};

export { getDocumentExportFileName };
