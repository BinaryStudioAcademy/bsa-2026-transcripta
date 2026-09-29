import { type DocumentExportStatusValue } from "@transcripta/shared";
import { useState } from "react";

import { Button, ExportDialog } from "~/libs/components/components.js";
import { INITIAL_COUNT } from "~/libs/constants/constants.js";
import {
	useAppDispatch,
	useAppSelector,
	useCallback,
	useEffect,
} from "~/libs/hooks/hooks.js";
import {
	actions as documentActions,
	type ExportFormatValue,
} from "~/modules/documents/documents.js";
import { DocumentExportStatus } from "~/modules/documents/libs/enums/enums.js";

import { DocumentSection } from "../document-section/document-section.js";
import { EXPORT_STATUS_ICONS } from "./libs/constants/constants.js";
import styles from "./styles.module.css";

const statusClassNames: Record<DocumentExportStatusValue, string | undefined> =
	{
		[DocumentExportStatus.FAILED]: styles["status-failed"],
		[DocumentExportStatus.QUEUED]: undefined,
		[DocumentExportStatus.READY]: styles["status-ready"],
	};

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

	useEffect(() => {
		for (const { exportId, status } of exports) {
			if (exportId !== null && status === DocumentExportStatus.QUEUED) {
				void dispatch(documentActions.watchExport({ documentId, exportId }));
			}
		}
	}, [dispatch, documentId, exports]);

	const handleOpenDialog = useCallback((): void => {
		setIsDialogOpen(true);
	}, []);

	const handleCancelDialog = useCallback((): void => {
		setIsDialogOpen(false);
	}, []);

	const handleConfirmDialog = useCallback(
		(format: ExportFormatValue): void => {
			setIsDialogOpen(false);
			void dispatch(
				documentActions.requestExport({ documentId, documentTitle, format }),
			);
		},
		[dispatch, documentId, documentTitle],
	);

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
								<span
									className={[
										styles["status"],
										statusClassNames[export_.status],
									]
										.filter(Boolean)
										.join(" ")}
								>
									{EXPORT_STATUS_ICONS[export_.status]}
								</span>
								<span className={styles["info"]}>
									<span className={styles["name"]}>{export_.name}</span>
									<span
										className={[
											styles["meta"],
											export_.status === DocumentExportStatus.FAILED &&
												styles["meta-failed"],
										]
											.filter(Boolean)
											.join(" ")}
									>
										{export_.readyMeta}
									</span>
								</span>
								{export_.status === DocumentExportStatus.READY &&
									export_.downloadUrl && (
										<a
											className={styles["download"]}
											download
											href={export_.downloadUrl}
											rel="noreferrer"
											target="_blank"
										>
											Download
										</a>
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
