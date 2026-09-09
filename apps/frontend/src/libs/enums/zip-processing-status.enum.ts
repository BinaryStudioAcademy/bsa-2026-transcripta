const ZipProcessingStatus = {
	BUILDING: "building",
	DONE: "done",
	ERROR: "error",
	EXTRACTING: "extracting",
	IDLE: "idle",
	SORTING: "sorting",
} as const;

export { ZipProcessingStatus };
