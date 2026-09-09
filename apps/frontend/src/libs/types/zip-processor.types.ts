import type { ZipProcessingStatus } from "~/libs/enums/zip-processing-status.enum.js";
import type { ValueOf } from "~/libs/types/types.js";

type WorkerDoneMessage = {
	payload: {
		pdfBytes: Uint8Array;
		totalPages: number;
	};
	type: "done";
};

type WorkerErrorMessage = {
	message: string;
	type: "error";
};

type WorkerMessage =
	| WorkerDoneMessage
	| WorkerErrorMessage
	| WorkerProgressMessage
	| WorkerValidationMessage;

type WorkerProgressMessage = {
	payload: {
		processedPages: number;
		totalPages: number;
	};
	type: "progress";
};

type WorkerValidationMessage = {
	message: string;
	rejectReason: ZipProcessorRejectReason;
	type: "validation";
};

type ZipProcessor = {
	process: (file: File) => void;
	reset: () => void;
	state: ZipProcessorState;
};

type ZipProcessorOptions = {
	onComplete: (pdfFile: File) => void;
	onError?: (message: string) => void;
};

type ZipProcessorRejectReason =
	| "invalid_content"
	| "no_images"
	| "too_large"
	| "too_many_pages";

type ZipProcessorState = {
	error: null | string;
	processedPages: number;
	progress: number;
	rejectReason: null | ZipProcessorRejectReason;
	status: ValueOf<typeof ZipProcessingStatus>;
	totalPages: number;
};

export type {
	WorkerDoneMessage,
	WorkerErrorMessage,
	WorkerMessage,
	WorkerProgressMessage,
	WorkerValidationMessage,
	ZipProcessor,
	ZipProcessorOptions,
	ZipProcessorState,
};
