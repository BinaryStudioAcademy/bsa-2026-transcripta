const DocumentNotificationMessage = {
	ABORT_ERROR: "AbortError",
	ABORTED: "Aborted",
	EXPIRED_LINK:
		"The upload link has expired. Requesting a new link and retrying...",
	UPLOAD_CANCELLED: "Upload cancelled",
	UPLOAD_FAILED: "Upload Failed",
} as const;

export { DocumentNotificationMessage };
