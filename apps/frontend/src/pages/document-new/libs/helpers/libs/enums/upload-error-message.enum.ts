const UploadErrorMessage = {
	FAILED_WITH_STATUS: (status: number): string =>
		`Upload failed with status ${String(status)}`,
	NETWORK_OR_ABORTED: "Network Error or Connection Aborted",
	UPLOAD_CANCELLED: "Upload cancelled",
	UPLOAD_NAME: "UploadError",
} as const;

export { UploadErrorMessage };
