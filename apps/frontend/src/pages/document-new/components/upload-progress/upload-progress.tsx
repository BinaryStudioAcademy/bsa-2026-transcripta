import React from "react";

import {
	BYTES_IN_KILOBYTE,
	KILOBYTES_IN_MEGABYTE,
} from "./libs/constants/constants.js";
import styles from "./styles.module.css";

type Properties = {
	fileName: string;
	fileSize: number;
	percent: number;
};

const UploadProgress: React.FC<Properties> = ({
	fileName,
	fileSize,
	percent,
}: Properties) => {
	return (
		<div>
			<div
				aria-valuemax={100}
				aria-valuemin={0}
				aria-valuenow={percent}
				className={styles["upload-progress-track"]}
				role="progressbar"
			>
				<div
					className={styles["upload-progress-fill"]}
					style={{ width: `${String(percent)}%` }}
				/>
			</div>
			<div className={styles["upload-progress-cap"]}>
				<span>
					{fileName} ·{" "}
					{Math.round(fileSize / BYTES_IN_KILOBYTE / KILOBYTES_IN_MEGABYTE)} MB
				</span>
				<span>{percent}%</span>
			</div>
		</div>
	);
};

export { UploadProgress };
