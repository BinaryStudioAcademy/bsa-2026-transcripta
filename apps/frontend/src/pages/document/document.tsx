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
	INITIAL_COUNT,
	NOTIFICATION_DELAY_MS,
} from "~/libs/constants/constants.js";
import { AppRoute, DataStatus } from "~/libs/enums/enums.js";
import {
	useAppDispatch,
	useAppSelector,
	useCallback,
	useEffect,
	useNavigate,
	useParams,
} from "~/libs/hooks/hooks.js";
import { notification } from "~/libs/modules/notification/notification.js";
import { actions as documentActions } from "~/modules/documents/documents.js";
import { DocumentStatus } from "~/modules/documents/libs/enums/enums.js";

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
	const { document: currentDocument, documentDataStatus } = useAppSelector(
		({ documents }) => ({
			document: documents.document,
			documentDataStatus: documents.documentDataStatus,
		}),
	);
	const [isConfirmOpen, setIsConfirmOpen] = useState(false);
	const [isRaiseLimitOpen, setIsRaiseLimitOpen] = useState(false);

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

	const notifiedDocumentsReference = useRef<Set<number>>(new Set());
	const isNotifyingReference = useRef<boolean>(false);
	const previousStatusReference = useRef<null | string>(null);

	useEffect(() => {
		if (!currentDocument) {
			previousStatusReference.current = null;
			return;
		}

		const documentIdFromParameters = Number(id);

		if (currentDocument.id !== documentIdFromParameters) {
			return;
		}

		const isBudgetStop = currentDocument.status === DocumentStatus.BUDGET_STOP;
		const previousStatus = previousStatusReference.current;

		previousStatusReference.current = currentDocument.status;

		const hasAlreadyBeenNotified = notifiedDocumentsReference.current.has(
			currentDocument.id,
		);

		const shouldNotify =
			isBudgetStop &&
			(!hasAlreadyBeenNotified ||
				previousStatus !== DocumentStatus.BUDGET_STOP);

		if (shouldNotify && !isNotifyingReference.current) {
			isNotifyingReference.current = true;

			notification.error(BUDGET_STOP_NOTIFICATION_MESSAGE);

			notifiedDocumentsReference.current.add(currentDocument.id);

			setTimeout(() => {
				isNotifyingReference.current = false;
			}, NOTIFICATION_DELAY_MS);
		}
	}, [currentDocument, currentDocument?.id, currentDocument?.status, id]);

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

		const documentId = currentDocument.id;

		void dispatch(documentActions.ingest(documentId))
			.unwrap()
			.then(async () => {
				await dispatch(documentActions.loadById(documentId)).unwrap();
				void dispatch(documentActions.startPolling(documentId));
			});
	}, [currentDocument, dispatch]);

	const pagesTranscribed = currentDocument
		? currentDocument.progress.pagesVerified +
			currentDocument.progress.pagesReadyToCheck +
			currentDocument.progress.pagesSkipped
		: INITIAL_COUNT;

	return (
		<div className={styles["document-page"]}>
			{isLoading && <LoaderOverlay label="Loading document" />}
			{hasError && <p>Unable to load the document.</p>}

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
										errorMessage={currentDocument.errorMessage}
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
