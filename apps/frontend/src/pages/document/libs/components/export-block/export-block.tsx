import { useState } from "react";

import { Button, ExportDialog } from "~/libs/components/components.js";
import { INITIAL_COUNT } from "~/libs/constants/constants.js";
import {
	useAppDispatch,
	useAppSelector,
	useCallback,
} from "~/libs/hooks/hooks.js";
import {
	actions as documentActions,
	type ExportFormatValue,
} from "~/modules/documents/documents.js";

import { DocumentSection } from "../document-section/document-section.js";
import styles from "./styles.module.css";

type Properties = {
	documentId: number;
	documentTitle: string;
	pagesTotal: number;
	pagesVerified: number;
};

const ExportBlock: React.FC<Properties> = ({
	documentId,
	documentTitle,
	pagesTotal,
	pagesVerified,
}: Properties) => {
	const dispatch = useAppDispatch();
	const exports = useAppSelector(
		({ documents }) => documents.documentExports[documentId] ?? [],
	);
	const [isDialogOpen, setIsDialogOpen] = useState(false);

	const handleOpenDialog = useCallback((): void => {
		setIsDialogOpen(true);
	}, []);

	const handleCancelDialog = useCallback((): void => {
		setIsDialogOpen(false);
	}, []);

	const handleConfirmDialog = useCallback(
		(format: ExportFormatValue): void => {
			setIsDialogOpen(false);
			void dispatch(documentActions.requestExport({ documentId, format }));
		},
		[dispatch, documentId],
	);

	// TODO: wire to a real file URL once #138 ships a download endpoint
	const handleDownloadClick = useCallback((): void => {}, []);

	return (
		<>
			<DocumentSection
				action={
					<Button isSecondary isSmall onClick={handleOpenDialog}>
						Export...
					</Button>
				}
				title="Export"
			>
				<p className={styles["note"]}>
					Exports include every page — unverified pages are exported as the
					model read them.
				</p>

				{exports.length === INITIAL_COUNT ? (
					<p className={styles["empty"]}>No exports yet.</p>
				) : (
					<ul className={styles["list"]}>
						{exports.map((export_) => (
							<li className={styles["row"]} key={export_.id}>
								<span className={styles["status"]}>
									{export_.ready ? "✓" : "░"}
								</span>
								<span className={styles["name"]}>{export_.name}</span>
								<span className={styles["meta"]}>{export_.readyMeta}</span>
								{export_.ready && (
									<Button isSmall onClick={handleDownloadClick}>
										Download
									</Button>
								)}
							</li>
						))}
					</ul>
				)}
			</DocumentSection>

			{isDialogOpen && (
				<ExportDialog
					documentTitle={documentTitle}
					onCancel={handleCancelDialog}
					onConfirm={handleConfirmDialog}
					pagesTotal={pagesTotal}
					pagesVerified={pagesVerified}
				/>
			)}
		</>
	);
};

export { ExportBlock };
