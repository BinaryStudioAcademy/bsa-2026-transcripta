const DocumentValidationMessage = {
	DOCUMENT_ACTIVE:
		"The document cannot be deleted while it is being ingested or processed. Pause it first.",
	DOCUMENT_ID_POSITIVE: "Document id must be a positive integer",
	DOCUMENT_MAX_FILE_BYTES:
		"The file exceeds the maximum allowed size (500 MB).",
	DOCUMENT_NOT_FOUND: "Document not found.",
	FILE_NAME_INVALID_NAME: "Unsupported type. PDFs and image archives only.",
	FILE_NAME_REQUIRE: "File name is required.",
	INVALID_STATUS_TO_PAUSE: "Document must be processing to be paused",
	INVALID_STATUS_TO_RESUME: "Document must be paused to be resumed",
	NOT_FOUND: "Document not found",
	PAGE_FROM_POSITIVE: "Page from must be a positive integer",
	PAGE_LIMIT_MAXIMUM: "Page limit must not exceed 50",
	PAGE_LIMIT_POSITIVE: "Page limit must be a positive integer",
	PRESET_ID_REQUIRE: "Preset ID is required.",
	PRESET_NOT_FOUND: "Preset not found.",
	RESUME_FAILED: "Failed to resume document processing",
	TITLE_REQUIRE: "Title is required.",
	USER_NOT_FOUND: "User not found.",
} as const;

export { DocumentValidationMessage };
