import { useState } from "react";

import { Button } from "~/libs/components/components.js";
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

import { ExportDialog } from "./export-dialog.js";

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
}) => {
	const dispatch = useAppDispatch();
	const exports = useAppSelector(({ documents }) => documents.documentExports);
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
			<h2>Export</h2>
			<Button label="Export…" onClick={handleOpenDialog} />

			<p>
				Exports include every page — unverified pages are exported as the model
				read them.
			</p>

			{exports.length === INITIAL_COUNT ? (
				<p>No exports yet.</p>
			) : (
				<ul>
					{exports.map((export_) => (
						<li key={export_.id}>
							<span>{export_.ready ? "✓" : "░"}</span>{" "}
							<span>{export_.name}</span> <span>{export_.readyMeta}</span>
							{export_.ready && (
								<Button
									isSmall
									label="Download"
									onClick={handleDownloadClick}
								/>
							)}
						</li>
					))}
				</ul>
			)}

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
