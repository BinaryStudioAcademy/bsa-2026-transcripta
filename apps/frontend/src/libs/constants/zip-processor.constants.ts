import type { ZipProcessorState } from "~/libs/types/zip-processor.types.js";

import { ZipProcessingStatus } from "~/libs/enums/zip-processing-status.enum.js";

const DEFAULT_STATE: ZipProcessorState = {
	error: null,
	processedPages: 0,
	progress: 0,
	rejectReason: null,
	status: ZipProcessingStatus.IDLE,
	totalPages: 0,
};

export { DEFAULT_STATE };
