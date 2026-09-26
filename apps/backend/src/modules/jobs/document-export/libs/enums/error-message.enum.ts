const ErrorMessage = {
	DOCUMENT_NOT_FOUND: (documentId: number) =>
		`Document with id ${documentId.toString()} not found`,
	EXPORT_FAILED: (exportId: number, documentId: number) =>
		`Failed to export document with id ${documentId.toString()}. Export ID: ${exportId.toString()}`,
} as const;

export { ErrorMessage };
