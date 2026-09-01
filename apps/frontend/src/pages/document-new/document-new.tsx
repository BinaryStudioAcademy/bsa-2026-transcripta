import React, { ChangeEvent, useCallback, useRef, useState } from "react";

import type { ScreenState } from "./libs/types.js";

import { UploadForm } from "./components/upload-form/upload-form.js";
import { FIRST_FILE_INDEX } from "./libs/constants.js";
import { validateFile } from "./libs/validate-file.js";
import styles from "./styles.module.css";

const handleUpload = (): void => {
	// TODO: need wiring real upload flow
};

const DocumentNew: React.FC = () => {
	const [isDragging, setIsDragging] = useState(false);
	const [selectedFile, setSelectedFile] = useState<File | null>(null);
	const [rejection, setRejection] = useState<null | string>(null);

	const getScreenState = (): ScreenState => {
		if (rejection) {
			return "rejected";
		}
		if (selectedFile) {
			return "selected";
		}

		return "rest";
	};

	const fileInputReference = useRef<HTMLInputElement>(null);

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

	const screenState = getScreenState();

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

					{screenState === "selected" && (
						<UploadForm
							onChangeFile={handleChangeFile}
							onSubmit={handleUpload}
						></UploadForm>
					)}
				</div>
			</main>
		</div>
	);
};

export { DocumentNew };
