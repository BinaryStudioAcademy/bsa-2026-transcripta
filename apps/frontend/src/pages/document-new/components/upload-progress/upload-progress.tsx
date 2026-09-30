import React from "react";

import { useOverflowTooltip } from "~/libs/hooks/hooks.js";

import {
	BYTES_IN_KILOBYTE,
	FILE_SIZE_FRACTION_DIGITS,
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
	const { checkTruncation, elementReference, isTruncated } =
		useOverflowTooltip<HTMLSpanElement>(fileName);

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
				<span className={styles["upload-progress-info"]}>
					<span
						className={[
							styles["upload-progress-file-wrapper"],
							isTruncated && "tx-tip",
						]
							.filter(Boolean)
							.join(" ")}
						data-tip={isTruncated ? fileName : undefined}
						onMouseEnter={checkTruncation}
					>
						<span
							className={styles["upload-progress-file-name"]}
							ref={elementReference}
						>
							{fileName}
						</span>
					</span>
					<span className={styles["upload-progress-size"]}>
						{" · "}
						{(fileSize / BYTES_IN_KILOBYTE / KILOBYTES_IN_MEGABYTE).toFixed(
							FILE_SIZE_FRACTION_DIGITS,
						)}{" "}
						MB
					</span>
				</span>
				<span className={styles["upload-progress-percent"]}>{percent}%</span>
			</div>
		</div>
	);
};

export { UploadProgress };
