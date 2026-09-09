const ErrorMessage = {
	FAILED_TO_CONVERT_PAGE:
		"Failed to convert PDF page to image. File may be corrupted",
	FAILED_TO_GET_PAGE_COUNT: "Failed to get page count. File may be corrupted",
	FAILED_TO_READ_PDF: "Failed to read PDF. It may be corrupted",
} as const;

export { ErrorMessage };
