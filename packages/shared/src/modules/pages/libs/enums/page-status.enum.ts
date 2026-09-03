const PageStatus = {
	BLANK: "blank",
	CONFIRMED: "confirmed",
	CORRECTED: "corrected",
	FAILED: "failed",
	PENDING: "pending",
	QUEUED: "queued",
	SKIPPED: "skipped",
	TRANSCRIBED: "transcribed",
	TRANSCRIBING: "transcribing",
} as const;

export { PageStatus };
