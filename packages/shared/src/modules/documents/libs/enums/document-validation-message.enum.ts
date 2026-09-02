const DocumentValidationMessage = {
	DOCUMENT_ID_POSITIVE: "Document id must be a positive integer",
	DOCUMENT_MAX_FILE_BYTES:
		"The file exceeds the maximum allowed size (500 MB).",
	DOCUMENT_NOT_FOUND: "Document not found",
	FILE_NAME_INVALID_NAME:
		"The file name must contain at least one character before the pdf extension. Only PDF files are allowed.",
	FILE_NAME_REQUIRE: "File name is required.",
	PRESET_ID_REQUIRE: "Preset ID is required.",
	PRESET_NOT_FOUND: "Preset not found.",
	TITLE_REQUIRE: "Title is required.",
	USER_NOT_FOUND: "User not found.",
} as const;

export { DocumentValidationMessage };
