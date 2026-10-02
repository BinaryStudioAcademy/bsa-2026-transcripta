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
	LexiconBlock,
	PagesBlock,
	TranscriptionBlock,
	VerificationBlock,
} from "./libs/components/components.js";
import { ALL_PAGES_BLANK_MESSAGE } from "./libs/constants/constants.js";
import styles from "./styles.module.css";

const notifiedBlankIds = new Set<number | string>();

const Document: React.FC = () => {
	const dispatch = useAppDispatch();
	const navigate = useNavigate();
	const location = useLocation();
	const locationState = location.state as null | {
		errorMessage?: string;
		isAllBlank?: boolean;
		isIngestStarted?: boolean;
	};
	const { document: currentDocument, documentDataStatus } = useAppSelector(
		({ documents }) => ({
			document: documents.document,
			documentDataStatus: documents.documentDataStatus,
		}),
	);
	const [isConfirmOpen, setIsConfirmOpen] = useState(false);
	const [isRaiseLimitOpen, setIsRaiseLimitOpen] = useState(false);
	const [serverValidationError, setServerValidationError] = useState<
		null | string
	>(null);

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

	useEffect(() => {
		if (
			!currentDocument ||
			currentDocument.id !== documentId ||
			currentDocument.status !== DocumentStatus.DRAFT ||
			locationState?.isIngestStarted
		) {
			return;
		}

		const documentIdToResume = currentDocument.id;

		void (async (): Promise<void> => {
			await navigate(AppRoute.DOCUMENTS_NEW, {
				replace: true,
				state: { documentId: documentIdToResume },
			});
		})();
	}, [currentDocument, documentId, locationState?.isIngestStarted, navigate]);

	const notifiedDocumentsReference = useRef<Set<number>>(new Set());
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

		const shouldNotifyBudget =
			isBudgetStop &&
			previousStatus !== DocumentStatus.BUDGET_STOP &&
			!notifiedDocumentsReference.current.has(currentDocument.id);

		if (shouldNotifyBudget) {
			notifiedDocumentsReference.current.add(currentDocument.id);
			notification.error(BUDGET_STOP_NOTIFICATION_MESSAGE);
		}

		if (
			!isBudgetStop &&
			notifiedDocumentsReference.current.has(currentDocument.id)
		) {
			notifiedDocumentsReference.current.delete(currentDocument.id);
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
			const safeErrorMessage = errorMessage?.trim()
				? errorMessage
				: INGESTION_FAILED_MESSAGE;

			notification.error(safeErrorMessage);
		}
	}, [
		currentDocument,
		currentDocument?.id,
		currentDocument?.status,
		currentDocument?.errorMessage,
		id,
		locationState?.errorMessage,
	]);

	const pagesTranscribed = currentDocument
		? currentDocument.progress.pagesVerified +
			currentDocument.progress.pagesReadyToCheck +
			currentDocument.progress.pagesSkipped
		: INITIAL_COUNT;

	useEffect(() => {
		const isReallyAllBlank =
			currentDocument &&
			currentDocument.pageCount > INITIAL_COUNT &&
			currentDocument.progress.pagesBlank === currentDocument.pageCount &&
			pagesTranscribed === INITIAL_COUNT &&
			currentDocument.progress.pagesVerified === INITIAL_COUNT;

		const shouldNotify = locationState?.isAllBlank || isReallyAllBlank;

		if (
			shouldNotify &&
			currentDocument &&
			!notifiedBlankIds.has(currentDocument.id)
		) {
			notifiedBlankIds.add(currentDocument.id);
			notification.info(ALL_PAGES_BLANK_MESSAGE);
		}
	}, [locationState?.isAllBlank, currentDocument, pagesTranscribed]);

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
		setServerValidationError(null);
		setIsRaiseLimitOpen(true);
	}, []);

	const handleCancelRaiseLimit = useCallback((): void => {
		setServerValidationError(null);
		setIsRaiseLimitOpen(false);
	}, []);

	const handleUpdateBudget = useCallback(
		(limitUsd: string): void => {
			if (!currentDocument) {
				return;
			}

			setServerValidationError(null);

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
				.catch((error: unknown) => {
					const typedError = error as {
						details?: { message: string }[];
						message?: string;
					};
					const firstDetail = typedError.details?.[INITIAL_COUNT];
					const errorMessage = firstDetail?.message ?? typedError.message ?? "";

					if (errorMessage) {
						setServerValidationError(errorMessage);
						return;
					}

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
									<TranscriptionBlock
										budgetLimitUsd={currentDocument.budget.limitUsd}
										budgetSpentUsd={currentDocument.budget.spentUsd}
										cursorPageNo={currentDocument.cursorPageNo}
										onRaiseLimitClick={handleOpenRaiseLimit}
										pagesBlank={currentDocument.progress.pagesBlank}
										pagesFailed={currentDocument.progress.pagesFailed}
										pagesTotal={currentDocument.pageCount}
										pagesTranscribed={pagesTranscribed}
										status={currentDocument.status}
									/>

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
										pagesTotal={currentDocument.pageCount}
										pagesTranscribed={pagesTranscribed}
										pagesVerified={currentDocument.progress.pagesVerified}
									/>

									<VerificationBlock
										cursorPageNo={currentDocument.cursorPageNo}
										documentId={currentDocument.id}
										pageCount={currentDocument.pageCount}
										pagesReadyToCheck={
											currentDocument.progress.pagesReadyToCheck
										}
										pagesSkipped={currentDocument.progress.pagesSkipped}
										pagesVerified={currentDocument.progress.pagesVerified}
									/>

									<LexiconBlock documentId={currentDocument.id} />

									<ExportBlock
										documentId={currentDocument.id}
										documentTitle={currentDocument.title}
										pagesTotal={currentDocument.pageCount}
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
					serverError={serverValidationError}
					spentUsd={currentDocument.budget.spentUsd}
				/>
			)}
		</div>
	);
};

export { Document };
