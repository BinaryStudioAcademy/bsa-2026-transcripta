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

	const handleOpenDeleteDialog = (): void => {
		setIsConfirmOpen(true);
	};

	const handleCancelDelete = (): void => {
		setIsConfirmOpen(false);
	};

	const handleConfirmDelete = async (): Promise<void> => {
		if (!currentDocument) {
			return;
		}

		const resultAction = await dispatch(
			documentActions.remove(currentDocument.id),
		);

		setIsConfirmOpen(false);

		// eslint-disable-next-line unicorn/prefer-regexp-test -- this is redux-toolkit's action matcher, not String#match
		if (documentActions.remove.fulfilled.match(resultAction)) {
			navigate(AppRoute.DOCUMENTS);
		}
	};

	const handleConfirmDeleteClick = (): void => {
		void handleConfirmDelete();
	};

	return (
		<>
			{isLoading && <LoaderOverlay label="Loading document" />}
			{hasError && <p>Unable to load the document.</p>}
			{currentDocument && (
				<>
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
					onConfirm={handleConfirmDeleteClick}
					title="Delete this document"
				/>
			)}
		</>
	);
};

export { Document };
