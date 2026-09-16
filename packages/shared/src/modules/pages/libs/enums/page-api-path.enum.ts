const PageApiPath = {
	DEBUG: "/:id/debug",
	REPROCESS: "/:id/reprocess",
	ROOT: "/",
	UNDO: "/:id/undo",
	VERIFY: "/:id/verify",
} as const;

export { PageApiPath };
