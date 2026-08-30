const DocumentValidationMessage = {
	DOCUMENT_MAX_FILE_BYTES:
		"The file exceeds the maximum allowed size (500 MB).",
	FILE_NAME_INVALID_EXTENSION: "Only PDF files are allowed",
	FILE_NAME_REQUIRE: "File name is required",
	PRESET_ID_REQUIRE: "Preset ID is required",
	TITLE_REQUIRE: "Title is required",
} as const;

export { DocumentValidationMessage };
