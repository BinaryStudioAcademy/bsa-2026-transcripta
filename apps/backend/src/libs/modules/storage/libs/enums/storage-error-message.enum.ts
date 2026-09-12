const StorageErrorMessage = {
	DELETE_OBJECTS_FAILED: "Failed to delete one or more storage objects.",
	EMPTY_PAGE_IMAGE: "Page image is missing or empty in storage",
	LIST_OBJECTS_MISSING_CONTINUATION_TOKEN:
		"Storage listing did not return a continuation token.",
	OBJECT_NOT_UPLOADED: "Object was not uploaded",
} as const;

export { StorageErrorMessage };
