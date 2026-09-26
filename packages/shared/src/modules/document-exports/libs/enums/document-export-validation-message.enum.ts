const DocumentExportValidationMessage = {
	DOCUMENT_EXPORT_ID_POSITIVE: "Document export id must be a positive integer",
	EXPORT_FORMAT_REQUIRE: "Export format is required",
	INVALID_EXPORT_FORMAT:
		"Invalid export format. Supported formats: csv, json, txt",
} as const;

export { DocumentExportValidationMessage };
