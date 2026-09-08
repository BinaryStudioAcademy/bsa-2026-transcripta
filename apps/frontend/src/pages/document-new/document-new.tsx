import { HTTPCode } from "@transcripta/shared";
import React, { useCallback, useEffect, useRef, useState } from "react";

import { AppRoute } from "~/libs/enums/app-route.enum.js";
import { DataStatus } from "~/libs/enums/data-status.enum.js";
import { configureString } from "~/libs/helpers/helpers.js";
import {
	useAppDispatch,
	useAppSelector,
	useLocation,
	useNavigate,
} from "~/libs/hooks/hooks.js";
import { notification } from "~/libs/modules/notification/notification.js";
import {
	actions as documentActions,
	type DocumentCreateRequestDto,
} from "~/modules/documents/documents.js";

import { Dropzone } from "./components/dropzone/dropzone.js";
import { UploadFormValues } from "./components/upload-form/libs/types/types.js";
import { UploadForm } from "./components/upload-form/upload-form.js";
import { UploadProgress } from "./components/upload-progress/upload-progress.js";
import {
	MAX_RETRIES,
	ZERO_UPLOAD_PROGRESS,
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

const DocumentNew: React.FC = () => {
	const [selectedFile, setSelectedFile] = useState<File | null>(null);
	const [rejection, setRejection] = useState<null | string>(null);
	const [uploadProgress, setUploadProgress] = useState(ZERO_UPLOAD_PROGRESS);
	const [isUploading, setIsUploading] = useState(false);
	const [isUploaded, setIsUploaded] = useState(false);

	const fileInputReference = useRef<HTMLInputElement>(null);
	const abortControllerReference = useRef<AbortController | null>(null);
	const createdDocumentIdReference = useRef<null | number>(null);

	const navigate = useNavigate();
	const dispatch = useAppDispatch();
	const location = useLocation();
	const resumeDocumentId = (location.state as LocationState | null)?.documentId;

	useEffect(() => {
		const handleBeforeUnload = (event: BeforeUnloadEvent): void => {
			if (isUploading) {
				event.preventDefault();
			}
		};

		window.addEventListener("beforeunload", handleBeforeUnload);
		return () => {
			window.removeEventListener("beforeunload", handleBeforeUnload);
		};
	}, [isUploading]);

	useEffect(() => {
		if (resumeDocumentId) {
			createdDocumentIdReference.current = Number(resumeDocumentId);
			void dispatch(documentActions.loadById(Number(resumeDocumentId)));
		}
	}, [resumeDocumentId, dispatch]);

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

			const fetchTargetUrl = async (): Promise<{
				docId: number;
				uploadUrl: string;
			}> => {
				const activeId = createdDocumentIdReference.current ?? resumeDocumentId;

				if (activeId) {
					const response = await dispatch(
						documentActions.getUploadUrl({
							id: Number(activeId),
							payload: {
								fileBytes: selectedFile.size,
								fileName: selectedFile.name,
								presetId: values.presetId,
								title: values.title,
							},
							signal: controller.signal,
						}),
					).unwrap();
					return { docId: Number(activeId), uploadUrl: response.uploadUrl };
				}

				const payload: DocumentCreateRequestDto = {
					fileBytes: selectedFile.size,
					fileName: selectedFile.name,
					presetId: values.presetId,
					title: values.title,
				};

				const response = await dispatch(
					documentActions.create(payload),
				).unwrap();
				createdDocumentIdReference.current = response.id;
				return { docId: response.id, uploadUrl: response.uploadUrl };
			};

			const attemptUpload = async (): Promise<void> => {
				let { docId, uploadUrl } = await fetchTargetUrl();

				if (!uploadUrl) {
					return;
				}

				let isSuccess = false;
				let retryCount = 0;

				while (!isSuccess) {
					try {
						await uploadFile({
							file: selectedFile,
							onProgress: setUploadProgress,
							signal: controller.signal,
							uploadUrl,
						});

						isSuccess = true;
					} catch (error: unknown) {
						if (controller.signal.aborted) {
							throw new Error(DocumentNotificationMessage.UPLOAD_CANCELLED);
						}

						const isForbiddenError =
							error instanceof UploadError &&
							error.status === HTTPCode.FORBIDDEN;

						if (isForbiddenError && docId && retryCount < MAX_RETRIES) {
							retryCount++;
							notification.error(DocumentNotificationMessage.EXPIRED_LINK);

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

			void attemptUpload()
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
						notification.error(DocumentNotificationMessage.UPLOAD_CANCELLED);
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

	const handleCancelUpload = useCallback(() => {
		if (abortControllerReference.current) {
			abortControllerReference.current.abort();
			abortControllerReference.current = null;
		}
		setIsUploading(false);
		setIsUploaded(false);
		setUploadProgress(ZERO_UPLOAD_PROGRESS);
	}, []);

	const handleProcessDocument = useCallback(() => {
		const targetId = createdDocumentIdReference.current ?? resumeDocumentId;
		if (!targetId) {
			return;
		}

		void dispatch(documentActions.ingest(Number(targetId)));

		void (async (): Promise<void> => {
			try {
				await navigate(
					configureString(AppRoute.DOCUMENT, {
						id: String(targetId),
					}),
				);
			} catch (error: unknown) {
				// eslint-disable-next-line no-console
				console.error(error);
			}
		})();
	}, [resumeDocumentId, dispatch, navigate]);

	const acceptFile = useCallback((file: File): void => {
		const result = validateFile(file);

		if (result.isValid) {
			setSelectedFile(file);
			setRejection(null);
		} else {
			setRejection(result.reason);
		}
	}, []);

	const handleChangeFile = useCallback((): void => {
		setSelectedFile(null);
		setRejection(null);
		setUploadProgress(ZERO_UPLOAD_PROGRESS);
		if (fileInputReference.current) {
			fileInputReference.current.value = "";
		}
	}, []);

	const getScreenState = (): ScreenStateType => {
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

	return (
		<div className={styles["new-document-page"]}>
			<header className={styles["page-header"]}>
				<h1 className={styles["page-header__title"]}>
					{resumeDocumentId ? "Resume document upload" : "New document"}
				</h1>
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
								/>
							</>
						)}
				</div>
			</main>
		</div>
	);
};

export { DocumentNew };
