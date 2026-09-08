import { useCallback, useEffect, useRef, useState } from "react";

import { BYTES_IN_KILOBYTE, KILOBYTES_IN_MEGABYTE } from "@transcripta/shared";
import { ZipProcessingStatus } from "~/libs/enums/zip-processing-status.enum.js";
import { type ValueOf } from "~/libs/types/types.js";
import pdfWorker from "~/libs/workers/zip-to-pdf.worker?worker";
import {
	DEFAULT_MAX_ARCHIVE_SIZE_MB,
	DEFAULT_MAX_PAGES,
} from "~/pages/document-new/libs/constants/constants.js";
import { PERCENT_MULTIPLIER } from "~/pages/document-new/libs/helpers/libs/constants/percent-multiplier.constant.js";

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

const DEFAULT_STATE: ZipProcessorState = {
	error: null,
	processedPages: 0,
	progress: 0,
	rejectReason: null,
	status: ZipProcessingStatus.IDLE,
	totalPages: 0,
};

const BYTES_IN_MEGABYTE = BYTES_IN_KILOBYTE * KILOBYTES_IN_MEGABYTE;

const toMegabytes = (bytes: number): number => {
	return bytes / BYTES_IN_MEGABYTE;
};

const getPdfFileName = (archiveName: string): string => {
	return `${archiveName.replace(/\.zip$/i, "")}.pdf`;
};

const isDoneMessage = (
	message: WorkerMessage,
): message is WorkerDoneMessage => {
	return message.type === "done";
};

const isValidationMessage = (
	message: WorkerMessage,
): message is WorkerValidationMessage => {
	return message.type === "validation";
};

const isProgressMessage = (
	message: WorkerMessage,
): message is WorkerProgressMessage => {
	return message.type === "progress";
};

const isErrorMessage = (
	message: WorkerMessage,
): message is WorkerErrorMessage => {
	return message.type === "error";
};

const useZipProcessor = (options: ZipProcessorOptions): ZipProcessor => {
	const [state, setState] = useState<ZipProcessorState>(DEFAULT_STATE);
	const workerReference = useRef<null | Worker>(null);
	const { onComplete, onError } = options;

	const terminateWorker = useCallback((): void => {
		if (workerReference.current) {
			workerReference.current.terminate();
			workerReference.current = null;
		}
	}, []);

	useEffect(() => {
		return terminateWorker;
	}, [terminateWorker]);

	const process = useCallback(
		(file: File): void => {
			if (toMegabytes(file.size) > DEFAULT_MAX_ARCHIVE_SIZE_MB) {
				const sizeLimit = String(DEFAULT_MAX_ARCHIVE_SIZE_MB);
				const message = `Archive exceeds the ${sizeLimit} MB size limit.`;

				setState({
					...DEFAULT_STATE,
					error: message,
					rejectReason: "too_large",
					status: ZipProcessingStatus.ERROR,
				});
				onError?.(message);

				return;
			}

			terminateWorker();

			const worker: Worker = new pdfWorker();

			workerReference.current = worker;
			setState({
				...DEFAULT_STATE,
				status: ZipProcessingStatus.EXTRACTING,
			});

			worker.addEventListener(
				"message",
				(event: MessageEvent<WorkerMessage>): void => {
					const message = event.data;

					if (isProgressMessage(message)) {
						const progress = Math.round(
							(message.payload.processedPages / message.payload.totalPages) *
								PERCENT_MULTIPLIER,
						);

						setState({
							...DEFAULT_STATE,
							processedPages: message.payload.processedPages,
							progress,
							status: ZipProcessingStatus.BUILDING,
							totalPages: message.payload.totalPages,
						});

						return;
					}

					if (isValidationMessage(message)) {
						terminateWorker();

						setState({
							...DEFAULT_STATE,
							error: message.message,
							rejectReason: message.rejectReason,
							status: ZipProcessingStatus.ERROR,
						});
						onError?.(message.message);

						return;
					}

					if (isErrorMessage(message)) {
						terminateWorker();

						setState({
							...DEFAULT_STATE,
							error: message.message,
							rejectReason: "invalid_content",
							status: ZipProcessingStatus.ERROR,
						});
						onError?.(message.message);

						return;
					}

					if (isDoneMessage(message)) {
						terminateWorker();

						const pdfFile = new File(
							[new Uint8Array(message.payload.pdfBytes)],
							getPdfFileName(file.name),
							{ type: "application/pdf" },
						);

						setState({
							...DEFAULT_STATE,
							processedPages: message.payload.totalPages,
							progress: PERCENT_MULTIPLIER,
							status: ZipProcessingStatus.DONE,
							totalPages: message.payload.totalPages,
						});
						onComplete(pdfFile);
					}
				},
			);

			worker.addEventListener("error", (): void => {
				terminateWorker();

				setState({
					...DEFAULT_STATE,
					error: "The ZIP archive failed to process.",
					rejectReason: "invalid_content",
					status: ZipProcessingStatus.ERROR,
				});
				onError?.("The ZIP archive failed to process.");
			});

			void file
				.arrayBuffer()
				.then((arrayBuffer) => {
					worker.postMessage({
						arrayBuffer,
						maxPages: DEFAULT_MAX_PAGES,
						type: "init",
					});
				})
				.catch(() => {
					terminateWorker();

					const message = "The ZIP archive could not be read.";

					setState({
						...DEFAULT_STATE,
						error: message,
						rejectReason: "invalid_content",
						status: ZipProcessingStatus.ERROR,
					});
					onError?.(message);
				});
		},
		[onComplete, onError, terminateWorker],
	);

	const reset = useCallback((): void => {
		terminateWorker();
		setState(DEFAULT_STATE);
	}, [terminateWorker]);

	return { process, reset, state };
};

export { useZipProcessor };
