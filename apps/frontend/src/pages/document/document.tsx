import { useRef, useState } from "react";

import {
	ConfirmDialog,
	Link,
	LoaderOverlay,
	RaiseLimitDialog,
	ThemeToggle,
} from "~/libs/components/components.js";
import {
	BUDGET_STOP_NOTIFICATION_MESSAGE,
	BUDGET_UPLOAD_FAILED_MESSAGE,
	INGESTION_FAILED_MESSAGE,
	INITIAL_COUNT,
	MINIMUM_VALID_DOCUMENT_ID,
	NOTIFICATION_DELAY_MS,
} from "~/libs/constants/constants.js";
import { AppRoute, DataStatus } from "~/libs/enums/enums.js";
import {
	useAppDispatch,
	useAppSelector,
	useCallback,
	useEffect,
	useLocation,
	useNavigate,
	useParams,
} from "~/libs/hooks/hooks.js";
import { notification } from "~/libs/modules/notification/notification.js";
import { actions as documentActions } from "~/modules/documents/documents.js";
import { DocumentStatus } from "~/modules/documents/libs/enums/enums.js";
import { NotFound } from "~/pages/not-found/not-found.js";

import {
	DocumentFailedBlock,
	DocumentTitleBlock,
	ExportBlock,
	GroundTruthBlock,
	PagesBlock,
	TranscriptionBlock,
	VerificationBlock,
} from "./libs/components/components.js";
import styles from "./styles.module.css";

const Document: React.FC = () => {
	const dispatch = useAppDispatch();
	const navigate = useNavigate();
	const location = useLocation();
	const locationState = location.state as null | { errorMessage?: string };
	const { document: currentDocument, documentDataStatus } = useAppSelector(
		({ documents }) => ({
			document: documents.document,
			documentDataStatus: documents.documentDataStatus,
		}),
	);
	const [isConfirmOpen, setIsConfirmOpen] = useState(false);
	const [isRaiseLimitOpen, setIsRaiseLimitOpen] = useState(false);

	const { id } = useParams();

	const documentId = Number(id);
	const isValidId =
		Number.isInteger(documentId) && documentId >= MINIMUM_VALID_DOCUMENT_ID;

	useEffect(() => {
		if (!isValidId) {
			return;
		}

		void dispatch(documentActions.loadById(documentId));
		void dispatch(documentActions.startPolling(documentId));

		return () => {
			dispatch(documentActions.stopPolling());
		};
	}, [documentId, isValidId, dispatch]);

	const notifiedDocumentsReference = useRef<Set<number>>(new Set());
	const isNotifyingReference = useRef<boolean>(false);
	const previousStatusReference = useRef<null | string>(null);
	const failedNotifiedDocumentsReference = useRef<Set<number>>(new Set());

	useEffect(() => {
		if (!currentDocument) {
			previousStatusReference.current = null;
			return;
		}

		const documentIdFromParameters = Number(id);

		if (currentDocument.id !== documentIdFromParameters) {
			return;
		}

		const isFailedStatus = currentDocument.status === DocumentStatus.FAILED;
		const isBudgetStop = currentDocument.status === DocumentStatus.BUDGET_STOP;
		const previousStatus = previousStatusReference.current;

		previousStatusReference.current = currentDocument.status;

		const hasBudgetBeenNotified = notifiedDocumentsReference.current.has(
			currentDocument.id,
		);

		const shouldNotifyBudget =
			isBudgetStop &&
			(!hasBudgetBeenNotified || previousStatus !== DocumentStatus.BUDGET_STOP);

		if (shouldNotifyBudget && !isNotifyingReference.current) {
			isNotifyingReference.current = true;

			notification.error(BUDGET_STOP_NOTIFICATION_MESSAGE);

			notifiedDocumentsReference.current.add(currentDocument.id);

			setTimeout(() => {
				isNotifyingReference.current = false;
			}, NOTIFICATION_DELAY_MS);
		}

		const hasFailedBeenNotified = failedNotifiedDocumentsReference.current.has(
			currentDocument.id,
		);

		if (isFailedStatus && !hasFailedBeenNotified) {
			failedNotifiedDocumentsReference.current.add(currentDocument.id);

			const errorMessage =
				currentDocument.errorMessage ||
				locationState?.errorMessage ||
				INGESTION_FAILED_MESSAGE;

			notification.error(errorMessage);
		}
	}, [
		currentDocument,
		currentDocument?.id,
		currentDocument?.status,
		currentDocument?.errorMessage,
		id,
		locationState?.errorMessage,
	]);

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
				return navigate(AppRoute.DOCUMENTS);
			})
			.catch(() => {
				setIsConfirmOpen(false);
			});
	}, [currentDocument, dispatch, navigate]);

	const handleOpenRaiseLimit = useCallback((): void => {
		setIsRaiseLimitOpen(true);
	}, []);

	const handleCancelRaiseLimit = useCallback((): void => {
		setIsRaiseLimitOpen(false);
	}, []);

	const handleUpdateBudget = useCallback(
		(limitUsd: string): void => {
			if (!currentDocument) {
				return;
			}

			void dispatch(
				documentActions.updateBudget({
					id: currentDocument.id,
					payload: { limitUsd },
				}),
			)
				.unwrap()
				.then(() => {
					setIsRaiseLimitOpen(false);
					void dispatch(documentActions.startPolling(currentDocument.id));
				})
				.catch(() => {
					notification.error(BUDGET_UPLOAD_FAILED_MESSAGE);
				});
		},
		[currentDocument, dispatch],
	);

	const handleRetry = useCallback((): void => {
		if (!currentDocument) {
			return;
		}

		const retryDocumentId = currentDocument.id;

		void dispatch(documentActions.ingest(retryDocumentId))
			.unwrap()
			.then(async () => {
				await dispatch(documentActions.loadById(retryDocumentId)).unwrap();
				void dispatch(documentActions.startPolling(retryDocumentId));
			});
	}, [currentDocument, dispatch]);

	const pagesTranscribed = currentDocument
		? currentDocument.progress.pagesVerified +
			currentDocument.progress.pagesReadyToCheck +
			currentDocument.progress.pagesSkipped
		: INITIAL_COUNT;

	const errorMessageToDisplay =
		currentDocument?.errorMessage ||
		locationState?.errorMessage ||
		INGESTION_FAILED_MESSAGE;

	if (!isValidId || hasError) {
		return <NotFound />;
	}

	return (
		<div className={styles["document-page"]}>
			{isLoading && <LoaderOverlay label="Loading document" />}

			{currentDocument && (
				<>
					<header className={styles["document-page__header"]}>
						<nav className={styles["document-page__breadcrumb"]}>
							<Link
								className={styles["document-page__breadcrumb-link"] ?? ""}
								to={AppRoute.DOCUMENTS}
							>
								Documents
							</Link>
							<span className={styles["document-page__breadcrumb-separator"]}>
								/
							</span>
							<span className={styles["document-page__breadcrumb-current"]}>
								{currentDocument.title}
							</span>
						</nav>
						<ThemeToggle />
					</header>

					<main className={styles["document-page__main"]}>
						<div className={styles["document-page__content"]}>
							<DocumentTitleBlock
								documentId={currentDocument.id}
								onDeleteClick={handleOpenDeleteDialog}
								pageCount={currentDocument.pageCount}
								presetName={currentDocument.preset.name}
								status={currentDocument.status}
								title={currentDocument.title}
							/>

							{isFailed ? (
								<section>
									<h2>Ingest failed</h2>
									<DocumentFailedBlock
										errorMessage={errorMessageToDisplay}
										onRetry={handleRetry}
									/>
								</section>
							) : (
								<>
									<PagesBlock
										cursorPageNo={currentDocument.cursorPageNo}
										pagesBlank={currentDocument.progress.pagesBlank}
										pagesFailed={currentDocument.progress.pagesFailed}
										pagesInWork={currentDocument.progress.pagesInWork}
										pagesPending={currentDocument.progress.pagesPending}
										pagesReadyToCheck={
											currentDocument.progress.pagesReadyToCheck
										}
										pagesSkipped={currentDocument.progress.pagesSkipped}
										pagesTotal={currentDocument.progress.pagesTotal}
										pagesTranscribed={pagesTranscribed}
										pagesVerified={currentDocument.progress.pagesVerified}
									/>

									<VerificationBlock
										cursorPageNo={currentDocument.cursorPageNo}
										documentId={currentDocument.id}
										pagesReadyToCheck={
											currentDocument.progress.pagesReadyToCheck
										}
										pagesSkipped={currentDocument.progress.pagesSkipped}
										pagesTranscribed={pagesTranscribed}
										pagesVerified={currentDocument.progress.pagesVerified}
									/>

									<TranscriptionBlock
										budgetLimitUsd={currentDocument.budget.limitUsd}
										budgetSpentUsd={currentDocument.budget.spentUsd}
										cursorPageNo={currentDocument.cursorPageNo}
										onRaiseLimitClick={handleOpenRaiseLimit}
										pagesBlank={currentDocument.progress.pagesBlank}
										pagesFailed={currentDocument.progress.pagesFailed}
										pagesTotal={currentDocument.progress.pagesTotal}
										pagesTranscribed={pagesTranscribed}
										status={currentDocument.status}
									/>

									<ExportBlock
										documentId={currentDocument.id}
										documentTitle={currentDocument.title}
										pagesTotal={currentDocument.progress.pagesTotal}
										pagesVerified={currentDocument.progress.pagesVerified}
									/>

									{currentDocument.groundTruth && (
										<GroundTruthBlock
											cer={currentDocument.groundTruth.cer}
											documentId={currentDocument.id}
											pagesTotal={currentDocument.groundTruth.pagesTotal}
											pagesTyped={currentDocument.groundTruth.pagesTyped}
										/>
									)}
								</>
							)}
						</div>
					</main>
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

			{isRaiseLimitOpen && currentDocument && (
				<RaiseLimitDialog
					currentLimitUsd={currentDocument.budget.limitUsd}
					onCancel={handleCancelRaiseLimit}
					onSubmit={handleUpdateBudget}
					spentUsd={currentDocument.budget.spentUsd}
				/>
			)}
		</div>
	);
};

export { Document };
