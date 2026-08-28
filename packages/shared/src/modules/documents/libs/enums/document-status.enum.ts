const DocumentStatus = {
	BUDGET_STOP: "budget_stop",
	DONE: "done",
	DRAFT: "draft",
	FAILED: "failed",
	INGESTING: "ingesting",
	PAUSED: "paused",
	PROCESSING: "processing",
	READY: "ready",
} as const;

export { DocumentStatus };
