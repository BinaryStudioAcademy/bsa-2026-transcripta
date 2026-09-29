import { type ExportFormatValue } from "../types/types.js";

const FALLBACK_FILE_NAME = "export";

const getExportFileName = (
	documentTitle: string,
	format: ExportFormatValue,
): string => {
	const slug = documentTitle
		.toLowerCase()
		.split(/[^\p{L}\p{N}]+/u)
		.filter(Boolean)
		.join("-");

	return `${slug || FALLBACK_FILE_NAME}.${format}`;
};

export { getExportFileName };
