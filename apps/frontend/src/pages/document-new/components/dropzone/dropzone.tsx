import React, { useCallback, useState } from "react";

import { FIRST_FILE_INDEX } from "./libs/constants/constants.js";
import styles from "./styles.module.css";

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
				accept="application/pdf"
				className={styles["dropzone__input--hidden"]}
				multiple={false}
				onChange={handleFileInputChange}
				ref={fileInputReference}
				type="file"
			/>
			{rejection ? (
				<div
					className={[styles["dropzone"], styles["dropzone--rejected"]].join(
						" ",
					)}
				>
					<b>{rejection}</b>
					<small>
						up to <span>500 MB</span>, up to <span>500 pages</span>
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
				</div>
			) : (
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
		</>
	);
};

export { Dropzone };
