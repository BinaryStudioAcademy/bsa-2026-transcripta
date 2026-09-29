import {
	BYTES_IN_KILOBYTE,
	DocumentValidationRule,
	KILOBYTES_IN_MEGABYTE,
} from "@transcripta/shared";

import {
	DEFAULT_MAX_ARCHIVE_SIZE_MB,
	DEFAULT_MAX_PAGES,
} from "~/pages/document-new/libs/constants/constants.js";

import styles from "./styles.module.css";

const DEFAULT_MAX_FILE_SIZE_MB =
	DocumentValidationRule.MAX_FILE_BYTES /
	(BYTES_IN_KILOBYTE * KILOBYTES_IN_MEGABYTE);

const DocumentsEmptyState: React.FC = () => (
	<div className={styles["empty"]}>
		<h2 className={styles["title"]}>No documents yet</h2>
		<p className={styles["description"]}>
			Upload a PDF and start verifying in about a minute.
		</p>
		<p className={styles["meta"]}>
			PDFs up to {DEFAULT_MAX_FILE_SIZE_MB} MB, ZIPs up to{" "}
			{DEFAULT_MAX_ARCHIVE_SIZE_MB} MB, up to {DEFAULT_MAX_PAGES} pages
		</p>
	</div>
);

export { DocumentsEmptyState };
