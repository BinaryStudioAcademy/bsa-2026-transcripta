const PageErrorMessage = {
	MANUAL_TRANSCRIPTION_NOT_ALLOWED:
		"Manual transcription is only allowed for failed pages",
	PAGE_NOT_FOUND: "Page not found",
	PAGE_NOT_REPROCESSABLE: "Page cannot be reprocessed",
	PAGE_NOT_VERIFIED: "Page is not verified",
	REPROCESS_FAILED: "Failed to reprocess page",
	TEXT_REQUIRED_FOR_CORRECTION: "Text is required for correction",
	TRANSCRIPTION_NOT_FOUND: "Transcription is no longer current",
	TRANSCRIPTION_UNAVAILABLE: "Transcription not found",
} as const;

export { PageErrorMessage };
