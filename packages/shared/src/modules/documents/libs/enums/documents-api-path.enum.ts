const DocumentsApiPath = {
	BY_ID: "/:id",
	BY_ID_PAGES: "/:id/pages",
	INGEST: "/:id/ingest",
	ROOT: "/",
	UPLOAD_URL: "/:id/upload-url",
} as const;

export { DocumentsApiPath };
