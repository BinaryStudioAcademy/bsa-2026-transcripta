import React, { ChangeEvent, useCallback, useRef, useState } from "react";

import { AppRoute } from "~/libs/enums/app-route.enum.js";
import { DataStatus } from "~/libs/enums/data-status.enum.js";
import { configureString } from "~/libs/helpers/helpers.js";
import {
	useAppDispatch,
	useAppSelector,
	useNavigate,
} from "~/libs/hooks/hooks.js";
import {
	actions as documentActions,
	type DocumentCreateRequestDto,
} from "~/modules/documents/documents.js";

import { UploadForm } from "./components/upload-form/upload-form.js";
import { UploadProgress } from "./components/upload-progress/upload-progress.js";
import {
	FIRST_FILE_INDEX,
	ZERO_UPLOAD_PROGRESS,
} from "./libs/constants/constants.js";
import { uploadFile } from "./libs/helpers/upload-file.js";
import { validateFile } from "./libs/helpers/validate-file.js";
import { type ScreenState, type UploadFormValues } from "./libs/types.js";
import styles from "./styles.module.css";

const DocumentNew: React.FC = () => {
	const [isDragging, setIsDragging] = useState(false);
	const [selectedFile, setSelectedFile] = useState<File | null>(null);
	const [rejection, setRejection] = useState<null | string>(null);
	const [uploadProgress, setUploadProgress] = useState(ZERO_UPLOAD_PROGRESS);
	const [isUploading, setIsUploading] = useState(false);
	const [isUploaded, setIsUploaded] = useState(false);

	const fileInputReference = useRef<HTMLInputElement>(null);

	const navigate = useNavigate();
	const dispatch = useAppDispatch();

	const { createDataStatus, createdDocument } = useAppSelector(
		({ documents }) => ({
			createDataStatus: documents.createDataStatus,
			createdDocument: documents.createdDocument,
		}),
	);

	const handleUpload = useCallback(
		(values: UploadFormValues) => {
			if (!selectedFile) {
				return;
			}

			const payload: DocumentCreateRequestDto = {
				fileBytes: selectedFile.size,
				fileName: selectedFile.name,
				presetId: values.presetId,
				title: values.title,
			};

			setIsUploading(true);

			void dispatch(documentActions.create(payload))
				.unwrap()
				.then((response) => {
					return uploadFile({
						file: selectedFile,
						onProgress: setUploadProgress,
						uploadUrl: response.uploadUrl,
					}).then(() => response);
				})
				.then(() => {
					setIsUploading(false);
					setIsUploaded(true);
				})
				.catch((error: unknown) => {
					setIsUploading(false);
					// eslint-disable-next-line no-console
					console.error(error);
				});
		},
		[selectedFile, dispatch],
	);

	const handleCancelUpload = useCallback(() => {
		setIsUploading(false);
		setIsUploaded(false);
		resetSelection();
		// TODO: decide and implement what to do if user uploaded document to S3 and cancelled before ingesting
	}, []);

	const handleProcessDocument = useCallback(() => {
		if (!createdDocument) {
			return;
		}

		void dispatch(documentActions.ingest(createdDocument.id))
			.unwrap()
			.then(() => {
				return navigate(
					configureString(AppRoute.DOCUMENT, {
						id: String(createdDocument.id),
					}),
				);
			})
			.catch((error: unknown) => {
				// eslint-disable-next-line no-console
				console.error(error);
			});
	}, [createdDocument, dispatch, navigate]);

	const handleDragOver = useCallback(
		(event: React.DragEvent<HTMLDivElement>) => {
			event.preventDefault();
			event.stopPropagation();
			setIsDragging(true);
		},
		[],
	);

	const handleDragLeave = useCallback(
		(event: React.DragEvent<HTMLDivElement>) => {
			event.preventDefault();
			event.stopPropagation();
			setIsDragging(false);
		},
		[],
	);

	const handleChooseFileClick = useCallback(() => {
		fileInputReference.current?.click();
	}, []);

	const acceptFile = useCallback((file: File): void => {
		const result = validateFile(file);

		if (result.isValid) {
			setSelectedFile(file);
			setRejection(null);
		} else {
			setRejection(result.reason);
		}
	}, []);

	const handleFileInputChange = useCallback(
		(event: ChangeEvent<HTMLInputElement>) => {
			const file = event.target.files?.[FIRST_FILE_INDEX];

			if (file) {
				acceptFile(file);
			}
		},
		[acceptFile],
	);

	const handleDrop = useCallback(
		(event: React.DragEvent<HTMLDivElement>) => {
			event.preventDefault();
			event.stopPropagation();
			setIsDragging(false);

			const file = event.dataTransfer.files[FIRST_FILE_INDEX];

			if (file) {
				acceptFile(file);
			}
		},
		[acceptFile],
	);

	const handleChangeFile = useCallback((): void => {
		resetSelection();
	}, []);

	const resetSelection = (): void => {
		setSelectedFile(null);
		setRejection(null);

		if (fileInputReference.current) {
			fileInputReference.current.value = "";
		}
	};

	const getScreenState = (): ScreenState => {
		if (rejection) {
			return "rejected";
		}
		if (isUploading) {
			return "uploading";
		}
		if (selectedFile) {
			return "selected";
		}

		return "rest";
	};

	const screenState = getScreenState();

	const isSubmitting = createDataStatus === DataStatus.PENDING;
	const isFormDisabled = isSubmitting || isUploading || isUploaded;

	return (
		<div className={styles["new-document-page"]}>
			<header className={styles["page-header"]}>
				<h1 className={styles["page-header__title"]}>New document</h1>
			</header>
			<main className={styles["upload-screen"]}>
				<div className={styles["upload-form__container"]}>
					<input
						accept="application/pdf"
						className={styles["upload-form__input--hidden"]}
						multiple={false}
						onChange={handleFileInputChange}
						ref={fileInputReference}
						type="file"
					/>
					{screenState === "rest" && (
						<div
							className={[
								styles["dropzone"],
								isDragging ? styles["dropzone--over"] : "",
							].join(" ")}
							onDragLeave={handleDragLeave}
							onDragOver={handleDragOver}
							onDrop={handleDrop}
						>
							<b>
								Drag a PDF here, or{" "}
								<button
									className={styles["dropzone__link"]}
									onClick={handleChooseFileClick}
								>
									choose a file
								</button>
							</b>
							<small>
								up to <span>500 MB</span>, up to <span>500 pages</span>
							</small>
						</div>
					)}

					{screenState === "rejected" && (
						<div
							className={[
								styles["dropzone"],
								styles["dropzone--rejected"],
							].join(" ")}
						>
							<b>{rejection}</b>
							<small>
								up to <span>500 MB</span>, up to <span>500 pages</span>
							</small>
							<button
								className={[
									styles["dropzone_button"],
									styles["dropzone_button--secondary"],
									styles["dropzone_button--sm"],
								].join(" ")}
								onClick={handleChooseFileClick}
							>
								Choose another file
							</button>
						</div>
					)}

					{(screenState === "selected" || screenState === "uploading") &&
						selectedFile && (
							<>
								<UploadProgress
									fileName={selectedFile.name}
									fileSize={selectedFile.size}
									percent={uploadProgress}
								/>
								<UploadForm
									fileName={selectedFile.name}
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
