import { BYTES_IN_KILOBYTE, KILOBYTES_IN_MEGABYTE } from "@transcripta/shared";
import { useCallback, useEffect, useRef, useState } from "react";

import type {
	WorkerDoneMessage,
	WorkerErrorMessage,
	WorkerMessage,
	WorkerProgressMessage,
	WorkerValidationMessage,
	ZipProcessor,
	ZipProcessorOptions,
	ZipProcessorState,
} from "~/libs/types/zip-processor.types.js";

import { DEFAULT_STATE } from "~/libs/constants/zip-processor.constants.js";
import { ZipProcessingStatus } from "~/libs/enums/zip-processing-status.enum.js";
import pdfWorker from "~/libs/workers/zip-to-pdf.worker?worker";
import {
	DEFAULT_MAX_ARCHIVE_SIZE_MB,
	DEFAULT_MAX_PAGES,
} from "~/pages/document-new/libs/constants/constants.js";
import { PERCENT_MULTIPLIER } from "~/pages/document-new/libs/helpers/libs/constants/percent-multiplier.constant.js";

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
			terminateWorker();

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
