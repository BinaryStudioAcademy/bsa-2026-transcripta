const StorageErrorMessage = {
	DELETE_OBJECTS_FAILED: "Failed to delete one or more storage objects.",
	LIST_OBJECTS_MISSING_CONTINUATION_TOKEN:
		"Storage listing did not return a continuation token.",
	OBJECT_NOT_UPLOADED: "Object was not uploaded",
} as const;

export { StorageErrorMessage };
