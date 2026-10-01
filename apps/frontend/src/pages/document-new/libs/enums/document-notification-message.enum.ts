const DocumentNotificationMessage = {
	ABORT_ERROR: "AbortError",
	EXPIRED_LINK:
		"The upload link has expired. Requesting a new link and retrying...",
	PROCESSING_FAILED:
		"This file couldn't be processed. Please upload a new file.",
	UPLOAD_CANCELLED: "Upload cancelled",
	UPLOAD_FAILED: "Upload Failed",
} as const;

export { DocumentNotificationMessage };
