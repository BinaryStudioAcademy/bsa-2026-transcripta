import React from "react";

import styles from "./styles.module.css";

const DocumentNew: React.FC = () => {
	return (
		<div className={styles["new-document-page"]}>
			<header className={styles["page-header"]}>
				<h1 className={styles["page-header__title"]}>New document</h1>
			</header>
			<main className={styles["upload-form"]}>
				<div className={styles["upload-form__container"]}>
					<input className={styles["upload-form__input--hidden"]} type="file" />
					<div className={styles["dropzone"]}>
						<b>
							Drag a PDF here, or{" "}
							<button className={styles["dropzone__link"]}>
								choose a file
							</button>
						</b>
						<small>
							up to <span>500 MB</span>, up to <span>500 pages</span>
						</small>
					</div>
				</div>
			</main>
		</div>
	);
};

export { DocumentNew };
