import { useState } from "react";

import {
	BudgetIndicator,
	ConfirmDialog,
	GroundTruthBlock,
	Link,
	LoaderOverlay,
	OverflowMenu,
	ProgressBar,
	StatusChip,
} from "~/libs/components/components.js";
import { AppRoute, DataStatus } from "~/libs/enums/enums.js";
import { configureString } from "~/libs/helpers/helpers.js";
import {
	useAppDispatch,
	useAppSelector,
	useCallback,
	useEffect,
	useNavigate,
	useParams,
} from "~/libs/hooks/hooks.js";
import { actions as documentActions } from "~/modules/documents/documents.js";

const Document: React.FC = () => {
	const dispatch = useAppDispatch();
	const navigate = useNavigate();
	const { document: currentDocument, documentDataStatus } = useAppSelector(
		({ documents }) => ({
			document: documents.document,
			documentDataStatus: documents.documentDataStatus,
		}),
	);
	const [isConfirmOpen, setIsConfirmOpen] = useState(false);

	const { id } = useParams();

	useEffect(() => {
		const documentId = Number(id);

		if (!Number.isFinite(documentId)) {
			return;
		}

		void dispatch(documentActions.loadById(documentId));
	}, [id, dispatch]);

	const isLoading = documentDataStatus === DataStatus.PENDING;
	const hasError = documentDataStatus === DataStatus.REJECTED;

	const handleOpenDeleteDialog = useCallback((): void => {
		setIsConfirmOpen(true);
	}, []);

	const handleCancelDelete = useCallback((): void => {
		setIsConfirmOpen(false);
	}, []);

	const handleConfirmDelete = useCallback((): void => {
		if (!currentDocument) {
			return;
		}

		void dispatch(documentActions.remove(currentDocument.id))
			.unwrap()
			.then(() => {
				setIsConfirmOpen(false);
				// eslint-disable-next-line sonarjs/void-use -- navigate() can return a promise here; no-floating-promises requires marking it void
				void navigate(AppRoute.DOCUMENTS);
			})
			.catch(() => {
				setIsConfirmOpen(false);
			});
	}, [currentDocument, dispatch, navigate]);

	return (
		<>
			{isLoading && <LoaderOverlay label="Loading document" />}
			{hasError && <p>Unable to load the document.</p>}
			{currentDocument && (
				<>
					<Link to={AppRoute.DOCUMENTS}>← Back to Documents</Link>
					<h1>{currentDocument.title}</h1>
					<StatusChip status={currentDocument.status} />
					<OverflowMenu
						items={[
							{
								isDanger: true,
								label: "Delete",
								onClick: handleOpenDeleteDialog,
							},
						]}
					/>

					<section>
						<h2>Transcription</h2>
						<ProgressBar
							closedPct={currentDocument.progress.closedPct}
							verifiedPct={currentDocument.progress.verifiedPct}
						/>
						<BudgetIndicator
							limitUsd={currentDocument.budget.limitUsd}
							spentUsd={currentDocument.budget.spentUsd}
						/>
					</section>

					<section>
						<h2>Verification</h2>
						<Link
							to={configureString(AppRoute.VERIFICATION, {
								id: String(currentDocument.id),
							})}
						>
							Resume at page{" "}
							<span className="tabular-figures">
								{currentDocument.cursorPageNo}
							</span>
						</Link>
					</section>

					{currentDocument.groundTruth && (
						<section>
							<h2>Ground truth</h2>
							<GroundTruthBlock
								cer={currentDocument.groundTruth.cer}
								documentId={currentDocument.id}
								pagesTotal={currentDocument.groundTruth.pagesTotal}
								pagesTyped={currentDocument.groundTruth.pagesTyped}
							/>
						</section>
					)}
				</>
			)}

			{isConfirmOpen && (
				<ConfirmDialog
					description="The transcription goes with it. This can't be undone."
					onCancel={handleCancelDelete}
					onConfirm={handleConfirmDelete}
					title="Delete this document"
				/>
			)}
		</>
	);
};

export { Document };
