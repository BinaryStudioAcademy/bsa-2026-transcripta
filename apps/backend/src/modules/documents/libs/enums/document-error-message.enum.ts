const DocumentErrorMessage = {
	DOWNLOAD_FAILED: "Failed to download the document",
	EXCEEDED_MAX_PAGES: "The document has too many pages (over 500).",
	INGEST_FAILED: "Failed to ingest the document",
	NOT_FOUND: "Document not found",
	PAGE_UPLOAD_FAILED: "Failed to upload a page",
} as const;

export { DocumentErrorMessage };
