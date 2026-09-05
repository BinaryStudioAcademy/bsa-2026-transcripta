const StorageErrorMessage = {
	DELETE_OBJECTS_FAILED: "Failed to delete one or more storage objects.",
	LIST_OBJECTS_MISSING_CONTINUATION_TOKEN:
		"Storage listing did not return a continuation token.",
} as const;

export { StorageErrorMessage };
