/* eslint-disable perfectionist/sort-objects */
const DocumentsApiPath = {
	BY_ID: "/:id",
	BY_ID_PAGES: "/:id/pages",
	INGEST: "/:id/ingest",
	ROOT: "/",
	PAUSE: "/:id/pause",
	RESUME: "/:id/resume",
} as const;

export { DocumentsApiPath };
