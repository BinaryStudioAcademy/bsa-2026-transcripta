const DocumentsApiPath = {
	BY_ID: "/:id",
	BY_ID_PAGES: "/:id/pages",
	INGEST: "/:id/ingest",
	PAUSE: "/:id/pause",
	RESUME: "/:id/resume",
	ROOT: "/",
} as const;

export { DocumentsApiPath };
