import {
	BYTES_IN_KILOBYTE,
	DocumentValidationRule,
	KILOBYTES_IN_MEGABYTE,
} from "@transcripta/shared";
import React, { useCallback, useState } from "react";

import {
	DEFAULT_MAX_ARCHIVE_SIZE_MB,
	DEFAULT_MAX_PAGES,
} from "~/pages/document-new/libs/constants/constants.js";

import { FIRST_FILE_INDEX } from "./libs/constants/constants.js";
import styles from "./styles.module.css";

const DEFAULT_MAX_FILE_SIZE_MB =
	DocumentValidationRule.MAX_FILE_BYTES /
	(BYTES_IN_KILOBYTE * KILOBYTES_IN_MEGABYTE);

type Properties = {
	fileInputReference: React.RefObject<HTMLInputElement | null>;
	onFileSelect: (file: File) => void;
	rejection: null | string;
};

const Dropzone: React.FC<Properties> = ({
	fileInputReference,
	onFileSelect,
	rejection,
}: Properties) => {
	const [isDragging, setIsDragging] = useState(false);

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

	const handleDrop = useCallback(
		(event: React.DragEvent<HTMLDivElement>) => {
			event.preventDefault();
			event.stopPropagation();
			setIsDragging(false);

			const file = event.dataTransfer.files[FIRST_FILE_INDEX];

			if (file) {
				onFileSelect(file);
			}
		},
		[onFileSelect],
	);

	const handleFileInputChange = useCallback(
		(event: React.ChangeEvent<HTMLInputElement>) => {
			const file = event.target.files?.[FIRST_FILE_INDEX];

			if (file) {
				onFileSelect(file);
			}
		},
		[onFileSelect],
	);

	const handleChooseFileClick = useCallback(() => {
		fileInputReference.current?.click();
	}, [fileInputReference]);

	return (
		<>
			<input
				accept="application/pdf,.zip"
				className={styles["dropzone__input--hidden"]}
				multiple={false}
				onChange={handleFileInputChange}
				ref={fileInputReference}
				type="file"
			/>

			<div
				className={[
					styles["dropzone"],
					isDragging ? styles["dropzone--over"] : "",
					rejection ? styles["dropzone--rejected"] : "",
				].join(" ")}
				onDragLeave={handleDragLeave}
				onDragOver={handleDragOver}
				onDrop={handleDrop}
			>
				{rejection ? (
					<>
						<b>{rejection}</b>
						<small>
							PDFs up to <span>{DEFAULT_MAX_FILE_SIZE_MB} MB</span>, ZIPs up to{" "}
							<span>{DEFAULT_MAX_ARCHIVE_SIZE_MB} MB</span>, up to{" "}
							<span>{DEFAULT_MAX_PAGES} pages</span>
						</small>
						<button
							className={[
								styles["dropzone__button"],
								styles["dropzone__button--secondary"],
								styles["dropzone__button--sm"],
							].join(" ")}
							onClick={handleChooseFileClick}
						>
							Choose another file
						</button>
					</>
				) : (
					<>
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
							PDFs up to <span>{DEFAULT_MAX_FILE_SIZE_MB} MB</span>, ZIPs up to{" "}
							<span>{DEFAULT_MAX_ARCHIVE_SIZE_MB} MB</span>, up to{" "}
							<span>{DEFAULT_MAX_PAGES} pages</span>
						</small>
					</>
				)}
			</div>
		</>
	);
};

export { Dropzone };
