import { EMPTY_LENGTH, HTTPCode } from "@transcripta/shared";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { useBlocker } from "react-router-dom";

import { ThemeToggle } from "~/libs/components/components.js";
import {
	INITIAL_COUNT as EMPTY_COUNT,
	UPLOAD_WARNING_MESSAGE,
} from "~/libs/constants/constants.js";
import { AppRoute, BlockerState, DataStatus } from "~/libs/enums/enums.js";
import { ZipProcessingStatus } from "~/libs/enums/zip-processing-status.enum.js";
import { configureString } from "~/libs/helpers/helpers.js";
import {
	useAppDispatch,
	useAppSelector,
	useLocation,
	useNavigate,
} from "~/libs/hooks/hooks.js";
import { useZipProcessor } from "~/libs/hooks/use-zip-processor/use-zip-processor.hook.js";
import { notification } from "~/libs/modules/notification/notification.js";
import {
	actions as documentActions,
	type DocumentCreateRequestDto,
} from "~/modules/documents/documents.js";
import { DocumentStatus } from "~/modules/documents/libs/enums/enums.js";
import { actions as presetsActions } from "~/modules/presets/presets.js";

import { Dropzone } from "./components/dropzone/dropzone.js";
import { IngestProgress } from "./components/ingest-progress/ingest-progress.js";
import { DEFAULT_PRESET_FALLBACK } from "./components/upload-form/libs/constants/constants.js";
import { UploadFormValues } from "./components/upload-form/libs/types/types.js";
import { UploadForm } from "./components/upload-form/upload-form.js";
import { UploadProgress } from "./components/upload-progress/upload-progress.js";
import {
	INGEST_POLL_INTERVAL_MS,
	INGEST_TIMEOUT_MS,
	MAX_RETRIES,
	ZERO_UPLOAD_PROGRESS,
	ZIP_FILE_REGEX,
} from "./libs/constants/constants.js";
import {
	DocumentNotificationMessage,
	ScreenState,
} from "./libs/enums/enums.js";
import {
	UploadError,
	uploadFile,
	validateFile,
} from "./libs/helpers/helpers.js";
import {
	type LocationState,
	type ScreenStateType,
} from "./libs/types/types.js";
import styles from "./styles.module.css";

type UploadTarget = {
	docId: number;
	uploadUrl: string;
};

const resolveUploadTarget = async ({
	controller,
	createdDocumentId,
	dispatch,
	file,
	persistDocumentId,
	resumeDocumentId,
	values,
}: {
	controller: AbortController;
	createdDocumentId: null | number;
	dispatch: ReturnType<typeof useAppDispatch>;
	file: File;
	persistDocumentId: (documentId: number) => void;
	resumeDocumentId: number | undefined;
	values: UploadFormValues;
}): Promise<UploadTarget> => {
	const activeId = createdDocumentId ?? resumeDocumentId;

	if (activeId) {
		const response = await dispatch(
			documentActions.getUploadUrl({
				id: Number(activeId),
				payload: {
					fileBytes: file.size,
					fileName: file.name,
					presetId: values.presetId,
					title: values.title,
				},
				signal: controller.signal,
			}),
		).unwrap();
		return { docId: Number(activeId), uploadUrl: response.uploadUrl };
	}

	const payload: DocumentCreateRequestDto = {
		fileBytes: file.size,
		fileName: file.name,
		presetId: values.presetId,
		title: values.title,
	};

	const response = await dispatch(documentActions.create(payload)).unwrap();
	persistDocumentId(response.id);
	return { docId: response.id, uploadUrl: response.uploadUrl };
};

const performUploadAttempts = async ({
	controller,
	createdDocumentId,
	dispatch,
	file,
	onProgress,
	persistDocumentId,
	resumeDocumentId,
	values,
}: {
	controller: AbortController;
	createdDocumentId: null | number;
	dispatch: ReturnType<typeof useAppDispatch>;
	file: File;
	onProgress: (progress: number) => void;
	persistDocumentId: (documentId: number) => void;
	resumeDocumentId: number | undefined;
	values: UploadFormValues;
}): Promise<void> => {
	let { docId, uploadUrl } = await resolveUploadTarget({
		controller,
		createdDocumentId,
		dispatch,
		file,
		persistDocumentId,
		resumeDocumentId,
		values,
	});

	if (!uploadUrl) {
		return;
	}

	let isSuccess = false;
	let retryCount = 0;

	while (!isSuccess) {
		try {
			await uploadFile({
				file,
				onProgress,
				signal: controller.signal,
				uploadUrl,
			});

			isSuccess = true;
		} catch (error: unknown) {
			if (controller.signal.aborted) {
				throw new Error(DocumentNotificationMessage.UPLOAD_CANCELLED);
			}

			const isForbiddenError =
				error instanceof UploadError && error.status === HTTPCode.FORBIDDEN;

			if (isForbiddenError && docId && retryCount < MAX_RETRIES) {
				retryCount++;
				notification.info(DocumentNotificationMessage.EXPIRED_LINK);

				const refreshed = await dispatch(
					documentActions.getUploadUrl({
						id: docId,
						signal: controller.signal,
					}),
				).unwrap();

				uploadUrl = refreshed.uploadUrl;
			} else {
				throw error;
			}
		}
	}
};

const DocumentNew: React.FC = () => {
	const { presets } = useAppSelector(({ presets }) => ({
		presets: presets.presets,
	}));
	const [selectedFile, setSelectedFile] = useState<File | null>(null);
	const [selectedArchive, setSelectedArchive] = useState<File | null>(null);
	const [rejection, setRejection] = useState<null | string>(null);
	const [uploadProgress, setUploadProgress] = useState(ZERO_UPLOAD_PROGRESS);
	const [isUploading, setIsUploading] = useState(false);
	const [isUploaded, setIsUploaded] = useState(false);
	const [ingestingDocumentId, setIngestingDocumentId] = useState<null | number>(
		null,
	);

	const fileInputReference = useRef<HTMLInputElement>(null);
	const abortControllerReference = useRef<AbortController | null>(null);
	const createdDocumentIdReference = useRef<null | number>(null);

	const navigate = useNavigate();
	const dispatch = useAppDispatch();
	const location = useLocation();
	const resumeDocumentId = (location.state as LocationState | null)?.documentId;

	const handleZipComplete = useCallback((pdfFile: File): void => {
		setSelectedArchive(null);
		setSelectedFile(pdfFile);
	}, []);

	const handleZipError = useCallback((message: string): void => {
		setSelectedArchive(null);
		setRejection(message);
	}, []);

	const {
		process: processZip,
		reset: resetZipProcessor,
		state: zipState,
	} = useZipProcessor({
		onComplete: handleZipComplete,
		onError: handleZipError,
	});

	const isZipProcessing =
		zipState.status === ZipProcessingStatus.EXTRACTING ||
		zipState.status === ZipProcessingStatus.BUILDING;

	const isBusy = isUploading || isZipProcessing;

	useEffect(() => {
		(
			globalThis as unknown as Window & { __IS_UPLOADING__?: boolean }
		).__IS_UPLOADING__ = isBusy;
	}, [isBusy]);

	const blocker = useBlocker(
		({ currentLocation, nextLocation }) =>
			isBusy && currentLocation.pathname !== nextLocation.pathname,
	);

	useEffect(() => {
		const handleBeforeUnload = (event: BeforeUnloadEvent): void => {
			if (isBusy) {
				event.preventDefault();
			}
		};

		window.addEventListener("beforeunload", handleBeforeUnload);
		return () => {
			window.removeEventListener("beforeunload", handleBeforeUnload);
		};
	}, [isBusy]);

	useEffect(() => {
		if (resumeDocumentId) {
			createdDocumentIdReference.current = Number(resumeDocumentId);
			void dispatch(documentActions.loadById(Number(resumeDocumentId)));
		}
	}, [resumeDocumentId, dispatch]);

	useEffect(() => {
		void dispatch(presetsActions.loadAll());
	}, [dispatch]);

	useEffect(() => {
		if (blocker.state === BlockerState.BLOCKED) {
			const confirmLeave = globalThis.confirm(UPLOAD_WARNING_MESSAGE);

			if (confirmLeave) {
				if (abortControllerReference.current) {
					abortControllerReference.current.abort();
				}
				resetZipProcessor();
				blocker.proceed();
			} else {
				blocker.reset();
			}
		}
	}, [blocker, resetZipProcessor]);

	const { dataStatus, resumedDocument } = useAppSelector(({ documents }) => ({
		dataStatus: documents.dataStatus,
		resumedDocument: documents.document,
	}));

	const handleUpload = useCallback(
		(values: UploadFormValues) => {
			if (!selectedFile) {
				return;
			}

			const controller = new AbortController();
			abortControllerReference.current = controller;
			setIsUploading(true);

			void performUploadAttempts({
				controller,
				createdDocumentId: createdDocumentIdReference.current,
				dispatch,
				file: selectedFile,
				onProgress: setUploadProgress,
				persistDocumentId: (documentId) => {
					createdDocumentIdReference.current = documentId;
				},
				resumeDocumentId,
				values,
			})
				.then(() => {
					if (controller.signal.aborted) {
						return;
					}
					setIsUploading(false);
					setIsUploaded(true);
				})
				.catch((error: unknown) => {
					setIsUploading(false);
					const isCancelled =
						controller.signal.aborted ||
						(error instanceof Error &&
							(error.message === DocumentNotificationMessage.UPLOAD_CANCELLED ||
								error.name === DocumentNotificationMessage.ABORT_ERROR));

					if (isCancelled) {
						return;
					}

					notification.error(
						error instanceof Error
							? error.message
							: DocumentNotificationMessage.UPLOAD_FAILED,
					);
				});
		},
		[selectedFile, resumeDocumentId, dispatch],
	);

	const resetSelection = useCallback((): void => {
		resetZipProcessor();
		setSelectedFile(null);
		setSelectedArchive(null);
		setRejection(null);
		setUploadProgress(ZERO_UPLOAD_PROGRESS);

		if (fileInputReference.current) {
			fileInputReference.current.value = "";
		}
	}, [resetZipProcessor]);

	const handleCancelUpload = useCallback(() => {
		if (abortControllerReference.current) {
			abortControllerReference.current.abort();
			abortControllerReference.current = null;
		}
		setIsUploading(false);
		setIsUploaded(false);
		resetSelection();
		notification.info(DocumentNotificationMessage.UPLOAD_CANCELLED);
	}, [resetSelection]);

	const goToDocument = useCallback(
		(documentId: number): void => {
			Promise.resolve(
				navigate(
					configureString(AppRoute.DOCUMENT, { id: String(documentId) }),
				),
			).catch(() => null);
		},
		[navigate],
	);

	const handleOpenDocument = useCallback((): void => {
		if (ingestingDocumentId) {
			setIngestingDocumentId(null);
			goToDocument(ingestingDocumentId);
		}
	}, [goToDocument, ingestingDocumentId]);

	const handleProcessDocument = useCallback(() => {
		const targetId = createdDocumentIdReference.current ?? resumeDocumentId;
		if (!targetId) {
			return;
		}

		setIngestingDocumentId(Number(targetId));
		void dispatch(documentActions.ingest(Number(targetId)));
	}, [resumeDocumentId, dispatch]);

	const acceptFile = useCallback(
		(file: File): void => {
			if (ZIP_FILE_REGEX.test(file.name)) {
				setSelectedArchive(file);
				setRejection(null);
				processZip(file);
				return;
			}

			const result = validateFile(file);

			if (result.isValid) {
				setSelectedFile(file);
				setRejection(null);
			} else {
				setRejection(result.reason);
			}
		},
		[processZip],
	);

	const handleChangeFile = useCallback((): void => {
		resetSelection();
	}, [resetSelection]);

	useEffect(() => {
		if (!ingestingDocumentId) {
			return;
		}

		const startedAt = Date.now();

		void dispatch(documentActions.loadById(ingestingDocumentId));

		const poll = (): void => {
			if (Date.now() - startedAt > INGEST_TIMEOUT_MS) {
				setIngestingDocumentId(null);
				goToDocument(ingestingDocumentId);

				return;
			}

			void dispatch(documentActions.pollDocumentById(ingestingDocumentId));
		};

		const timer = setInterval(poll, INGEST_POLL_INTERVAL_MS);

		return (): void => {
			clearInterval(timer);
		};
	}, [dispatch, goToDocument, ingestingDocumentId]);

	useEffect(() => {
		if (!ingestingDocumentId || resumedDocument?.id !== ingestingDocumentId) {
			return;
		}

		const { progress, status } = resumedDocument;

		if (status === DocumentStatus.FAILED) {
			setIngestingDocumentId(null);
			goToDocument(ingestingDocumentId);

			return;
		}

		if (progress.pagesReadyToCheck > EMPTY_COUNT) {
			setIngestingDocumentId(null);
			Promise.resolve(
				navigate(
					configureString(AppRoute.VERIFICATION, {
						id: String(ingestingDocumentId),
					}),
				),
			).catch(() => null);
		}
	}, [goToDocument, ingestingDocumentId, navigate, resumedDocument]);

	const getScreenState = (): ScreenStateType => {
		if (ingestingDocumentId) {
			return ScreenState.INGESTING;
		}
		if (isZipProcessing) {
			return ScreenState.PROCESSING;
		}
		if (isUploading) {
			return ScreenState.UPLOADING;
		}
		if (selectedFile) {
			return ScreenState.SELECTED;
		}

		return ScreenState.REST;
	};

	const screenState = getScreenState();
	const isSubmitting = dataStatus === DataStatus.PENDING;
	const isFormDisabled = isSubmitting || isUploading || isUploaded;
	const displayTitle = selectedFile?.name ?? resumedDocument?.title ?? "";

	const presetOptions =
		presets.length > EMPTY_LENGTH ? presets : [DEFAULT_PRESET_FALLBACK];

	return (
		<div className={styles["new-document-page"]}>
			<header className={styles["page-header"]}>
				<h1 className={styles["page-header__title"]}>
					{resumeDocumentId ? "Resume document upload" : "New document"}
				</h1>

				<ThemeToggle />
			</header>
			<main className={styles["upload-screen"]}>
				<div className={styles["upload-form__container"]}>
					{screenState === ScreenState.REST && (
						<Dropzone
							fileInputReference={fileInputReference}
							onFileSelect={acceptFile}
							rejection={rejection}
						/>
					)}

					{screenState === ScreenState.INGESTING && (
						<IngestProgress
							onOpenDocument={handleOpenDocument}
							pagesReady={
								(resumedDocument?.progress.pagesReadyToCheck ?? EMPTY_COUNT) +
								(resumedDocument?.progress.pagesVerified ?? EMPTY_COUNT)
							}
							pagesTotal={resumedDocument?.progress.pagesTotal ?? EMPTY_COUNT}
							title={displayTitle}
						/>
					)}

					{screenState === ScreenState.PROCESSING && selectedArchive && (
						<UploadProgress
							fileName={selectedArchive.name}
							fileSize={selectedArchive.size}
							percent={zipState.progress}
						/>
					)}

					{(screenState === ScreenState.SELECTED ||
						screenState === ScreenState.UPLOADING) &&
						selectedFile && (
							<>
								<UploadProgress
									fileName={selectedFile.name}
									fileSize={selectedFile.size}
									percent={uploadProgress}
								/>
								<UploadForm
									fileName={displayTitle}
									isSubmitting={isFormDisabled}
									isUploaded={isUploaded}
									onCancelUpload={handleCancelUpload}
									onChangeFile={handleChangeFile}
									onProcessDocument={handleProcessDocument}
									onSubmit={handleUpload}
									presetOptions={presetOptions}
								/>
							</>
						)}
				</div>
			</main>
		</div>
	);
};

export { DocumentNew };
