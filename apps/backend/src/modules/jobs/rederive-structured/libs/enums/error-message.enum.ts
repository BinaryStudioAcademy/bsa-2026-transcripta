const ErrorMessage = {
	BUDGET_EXCEEDED: (documentId: number) =>
		`Failed to rederive structured: Budget exceeded. Document ID: ${documentId.toString()}`,
	DOCUMENT_NOT_FOUND: (documentId: number) =>
		`Failed to rederive structured: Document not found. Document ID: ${documentId.toString()}`,
	REDERIVE_FAILED: (pageId: number) =>
		`Failed to rederive structured. Page ID: ${pageId.toString()}`,
	TRANSCRIPTION_NOT_FOUND: (pageId: number) =>
		`Failed to rederive structured: Current transcription for the page not found. Page ID: ${pageId.toString()}`,
	TRANSCRIPTION_OUTDATED: (transcriptionId: number) =>
		`Failed to rederive structured: Transcription is no longer current. Transcription ID: ${transcriptionId.toString()}`,
} as const;

export { ErrorMessage };
