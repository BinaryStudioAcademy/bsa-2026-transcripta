import React, { useCallback, useRef, useState } from "react";

import { AppRoute } from "~/libs/enums/app-route.enum.js";
import { DataStatus } from "~/libs/enums/data-status.enum.js";
import { ZipProcessingStatus } from "~/libs/enums/zip-processing-status.enum.js";
import { configureString } from "~/libs/helpers/helpers.js";
import {
	useAppDispatch,
	useAppSelector,
	useNavigate,
} from "~/libs/hooks/hooks.js";
import { useZipProcessor } from "~/libs/hooks/use-zip-processor/use-zip-processor.hook.js";
import {
	actions as documentActions,
	type DocumentCreateRequestDto,
} from "~/modules/documents/documents.js";

import { Dropzone } from "./components/dropzone/dropzone.js";
import { UploadFormValues } from "./components/upload-form/libs/types/types.js";
import { UploadForm } from "./components/upload-form/upload-form.js";
import { UploadProgress } from "./components/upload-progress/upload-progress.js";
import {
	ZERO_UPLOAD_PROGRESS,
	ZIP_FILE_REGEX,
} from "./libs/constants/constants.js";
import { ScreenState } from "./libs/enums/enums.js";
import { uploadFile, validateFile } from "./libs/helpers/helpers.js";
import { type ScreenStateType } from "./libs/types/types.js";
import styles from "./styles.module.css";

const DocumentNew: React.FC = () => {
	const [selectedFile, setSelectedFile] = useState<File | null>(null);
	const [selectedArchive, setSelectedArchive] = useState<File | null>(null);
	const [rejection, setRejection] = useState<null | string>(null);
	const [uploadProgress, setUploadProgress] = useState(ZERO_UPLOAD_PROGRESS);
	const [isUploading, setIsUploading] = useState(false);
	const [isUploaded, setIsUploaded] = useState(false);

	const fileInputReference = useRef<HTMLInputElement>(null);

	const navigate = useNavigate();
	const dispatch = useAppDispatch();

	const { createdDocument, dataStatus } = useAppSelector(
		({ documents }) => documents,
	);

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
		setIsUploading(false);
		setIsUploaded(false);
		resetSelection();
		// TODO: decide and implement what to do if user uploaded document to S3 and cancelled before ingesting
	}, [resetSelection]);

	const handleProcessDocument = useCallback(() => {
		if (!createdDocument) {
			return;
		}

		void dispatch(documentActions.ingest(createdDocument.id));

		void (async (): Promise<void> => {
			try {
				await navigate(
					configureString(AppRoute.DOCUMENT, {
						id: String(createdDocument.id),
					}),
				);
			} catch (error: unknown) {
				// eslint-disable-next-line no-console
				console.error(error);
			}
		})();
	}, [createdDocument, dispatch, navigate]);

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

	const isZipProcessing =
		zipState.status === ZipProcessingStatus.EXTRACTING ||
		zipState.status === ZipProcessingStatus.BUILDING;

	const getScreenState = (): ScreenStateType => {
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

	return (
		<div className={styles["new-document-page"]}>
			<header className={styles["page-header"]}>
				<h1 className={styles["page-header__title"]}>New document</h1>
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
