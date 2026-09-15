import { useState } from "react";

import {
	BudgetIndicator,
	ConfirmDialog,
	GroundTruthBlock,
	Link,
	LoaderOverlay,
	OverflowMenu,
	ProgressBar,
} from "~/libs/components/components.js";
import { INITIAL_COUNT } from "~/libs/constants/constants.js";
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

import {
	DocumentFailedBlock,
	DocumentStatusBlock,
} from "./libs/components/components.js";
import { DocumentStatus } from "./libs/enums/enums.js";

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
		void dispatch(documentActions.startPolling(documentId));

		return () => {
			dispatch(documentActions.stopPolling());
		};
	}, [id, dispatch]);

	const isLoading =
		documentDataStatus === DataStatus.PENDING && !currentDocument;
	const hasError =
		documentDataStatus === DataStatus.REJECTED && !currentDocument;
	const isFailed = currentDocument?.status === DocumentStatus.FAILED;

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

	const handleRetry = useCallback((): void => {
		if (!currentDocument) {
			return;
		}

		void dispatch(documentActions.ingest(currentDocument.id))
			.unwrap()
			.then(() => {
				void dispatch(documentActions.loadById(currentDocument.id));
			});
	}, [currentDocument, dispatch]);

	return (
		<>
			{isLoading && <LoaderOverlay label="Loading document" />}
			{hasError && <p>Unable to load the document.</p>}
			{currentDocument && (
				<>
					<Link to={AppRoute.DOCUMENTS}>← Back to Documents</Link>
					<h1>{currentDocument.title}</h1>
					<DocumentStatusBlock
						documentId={currentDocument.id}
						status={currentDocument.status}
					/>
					<OverflowMenu
						items={[
							{
								isDanger: true,
								label: "Delete",
								onClick: handleOpenDeleteDialog,
							},
						]}
					/>

					{isFailed ? (
						<section>
							<h2>Ingest failed</h2>
							<DocumentFailedBlock
								errorMessage={currentDocument.errorMessage}
								onRetry={handleRetry}
							/>
						</section>
					) : (
						<>
							<section>
								<h2>Transcription</h2>
								<ProgressBar
									closedPct={currentDocument.progress.closedPct}
									verifiedPct={currentDocument.progress.verifiedPct}
								/>
								<div>
									<span className="tabular-figures">
										{currentDocument.progress.pagesVerified}
									</span>{" "}
									of{" "}
									<span className="tabular-figures">
										{currentDocument.progress.pagesTotal}
									</span>{" "}
									pages verified
									{currentDocument.progress.pagesInWork > INITIAL_COUNT && (
										<span>
											{" "}
											·{" "}
											<span className="tabular-figures">
												{currentDocument.progress.pagesInWork}
											</span>{" "}
											in work
										</span>
									)}
								</div>
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
						</>
					)}

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
