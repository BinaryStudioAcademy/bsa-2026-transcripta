import { LoaderOverlay } from "~/libs/components/components.js";
import { INITIAL_COUNT } from "~/libs/constants/constants.js";
import {
	AppRoute,
	DataStatus,
	PageVerificationAction,
} from "~/libs/enums/enums.js";
import { configureString } from "~/libs/helpers/helpers.js";
import {
	useAppDispatch,
	useAppSelector,
	useCallback,
	useEffect,
	useNavigate,
	useParams,
	useRef,
	useState,
} from "~/libs/hooks/hooks.js";
import { notification } from "~/libs/modules/notification/notification.js";
import { actions as documentActions } from "~/modules/documents/documents.js";
import { VerificationQueueMessage } from "~/modules/pages/libs/constants/constants.js";
import {
	actions as pageActions,
	selectCurrentPage,
	selectCursorPageNo,
	selectIsVerificationQueueBusy,
	selectLastVerifiedPageId,
	selectPagesDataStatus,
	selectPagesForStrip,
	selectReprocessingPageId,
	selectVerificationCursorPageNo,
	type VerifyPageRequestDto,
} from "~/modules/pages/pages.js";

import "./verification.css";
import {
	VerificationFooter,
	VerificationHeader,
	VerificationShortcutsDialog,
	VerificationWorkspace,
} from "./libs/components/components.js";
import {
	MAX_LOADED_PAGES,
	MIN_NUMBER_OF_PAGES,
	PAGE_STEP,
} from "./libs/constants/verification.constants.js";
import { DocumentStatus, PageStatus } from "./libs/enums/enums.js";
import { getPagesFrom } from "./libs/helpers/get-pages-from.helper.js";
import { isDocumentFullyRead } from "./libs/helpers/is-document-fully-read.helper.js";
import { isPageBeingRead } from "./libs/helpers/is-page-being-read.helper.js";
import { useDraftRedirect } from "./libs/hooks/use-draft-redirect.hook.js";
import { useProcessingToggle } from "./libs/hooks/use-processing-toggle.hook.js";
import { useScanZoom } from "./libs/hooks/use-scan-zoom.js";
import { useVerificationKeyboard } from "./libs/hooks/use-verification-keyboard.hook.js";
import { useVerificationPolling } from "./libs/hooks/use-verification-polling.hook.js";
import { useVerificationShortcuts } from "./libs/hooks/use-verification-shortcuts.hook.js";
import {
	type DocumentGetPagesItemResponseDto,
	type EditConflictDraft,
	type PageVerificationActionValue,
	type ProcessQueuePayload,
} from "./libs/types/types.js";

const countClosedPages = (
	pages: (DocumentGetPagesItemResponseDto | undefined)[],
): number =>
	pages.filter(
		(page) =>
			page &&
			page.status !== PageStatus.TRANSCRIBED &&
			page.status !== PageStatus.PENDING,
	).length;

const Verification: React.FC = () => {
	const dispatch = useAppDispatch();
	const navigate = useNavigate();
	const { id } = useParams();
	const { handleCloseShortcuts, handleToggleShortcuts, isShortcutsOpen } =
		useVerificationShortcuts();

	const [isEditing, setIsEditing] = useState(false);
	const { isZoomed, scanRef, toggleZoom, zoom } = useScanZoom();
	const [editConflictDraft, setEditConflictDraft] =
		useState<EditConflictDraft | null>(null);

	const pageStartedAtReference = useRef(Date.now());
	const isCompletionHandledReference = useRef(false);
	const cursorInitializedForReference = useRef<null | number>(null);

	const document = useAppSelector(({ documents }) => documents.document);
	const documentDataStatus = useAppSelector(
		({ documents }) => documents.documentDataStatus,
	);

	const currentPage = useAppSelector(selectCurrentPage);
	const lastVerifiedPageId = useAppSelector(selectLastVerifiedPageId);
	const pagesDataStatus = useAppSelector(selectPagesDataStatus);
	const pagesForStrip = useAppSelector(selectPagesForStrip);
	const cursorPageNo = useAppSelector(selectCursorPageNo);
	const isVerificationQueueBusy = useAppSelector(selectIsVerificationQueueBusy);
	const verificationCursorPageNo = useAppSelector(
		selectVerificationCursorPageNo,
	);
	const reprocessingPageId = useAppSelector(selectReprocessingPageId);

	const isReprocessing =
		currentPage !== undefined && reprocessingPageId === currentPage.id;
	const isDocumentLoading = documentDataStatus === DataStatus.PENDING;
	const isPagesLoading = pagesDataStatus === DataStatus.PENDING;

	const { isPaused, isToggleDisabled, isToggleVisible, onToggleProcessing } =
		useProcessingToggle(document);

	const isLastPage = Boolean(document && cursorPageNo >= document.pageCount);
	const isDocumentDone = isDocumentFullyRead(document);
	const isBeingRead = isPageBeingRead(currentPage);
	const isBudgetStopped = document?.status === DocumentStatus.BUDGET_STOP;

	useEffect(() => {
		const documentId = Number(id);
		if (!Number.isFinite(documentId)) {
			return;
		}

		cursorInitializedForReference.current = null;
		isCompletionHandledReference.current = false;
		dispatch(pageActions.reset());
		void dispatch(documentActions.loadById(documentId));
		void dispatch(documentActions.startPolling(documentId));

		return () => {
			dispatch(documentActions.stopPolling());
		};
	}, [id, dispatch]);

	useDraftRedirect(document, Number(id));

	useVerificationPolling({
		currentPage,
		cursorPageNo,
		document,
		documentId: Number(id),
		isDocumentDone,
	});

	useEffect(() => {
		if (
			!document ||
			document.id !== Number(id) ||
			cursorInitializedForReference.current === document.id
		) {
			return;
		}

		cursorInitializedForReference.current = document.id;
		const initialPageNo = Math.max(
			MIN_NUMBER_OF_PAGES,
			Math.min(
				document.cursorPageNo || MIN_NUMBER_OF_PAGES,
				document.pageCount || MIN_NUMBER_OF_PAGES,
			),
		);
		dispatch(pageActions.setCursorPageNo(initialPageNo));
	}, [document, dispatch, id]);

	useEffect(() => {
		if (!document || cursorPageNo < MIN_NUMBER_OF_PAGES || isPagesLoading) {
			return;
		}

		const isPageLoaded = pagesForStrip.some(
			(page) => page?.pageNo === cursorPageNo,
		);
		if (isPageLoaded) {
			return;
		}

		void dispatch(
			pageActions.loadPages({
				documentId: document.id,
				query: {
					from: getPagesFrom(cursorPageNo),
					limit: MAX_LOADED_PAGES,
				},
			}),
		);
	}, [cursorPageNo, document, dispatch, isPagesLoading, pagesForStrip]);

	useEffect(() => {
		if (currentPage) {
			pageStartedAtReference.current = Date.now();
		}
	}, [currentPage]);

	useEffect(() => {
		setIsEditing(false);
	}, [cursorPageNo]);

	const goToCompletedDocument = useCallback(
		(documentId: number): void => {
			if (isCompletionHandledReference.current) {
				return;
			}

			isCompletionHandledReference.current = true;
			notification.success(VerificationQueueMessage.COMPLETED);

			Promise.resolve(
				navigate(
					configureString(AppRoute.DOCUMENT, { id: String(documentId) }),
					{ replace: true },
				),
			).catch(() => {
				return null;
			});
		},
		[navigate],
	);

	const runVerificationQueue = useCallback((): void => {
		void dispatch(pageActions.processVerificationQueue()).then((result) => {
			if (result.type !== pageActions.processVerificationQueue.fulfilled.type) {
				return;
			}

			const payload = result.payload as ProcessQueuePayload;
			const { completedDocumentId, failed } = payload;
			const totalClosed = countClosedPages(pagesForStrip);

			const isTrulyCompleted =
				document !== null &&
				document.pageCount > INITIAL_COUNT &&
				totalClosed >= document.pageCount;

			if (
				(completedDocumentId !== null || isTrulyCompleted) &&
				document !== null
			) {
				goToCompletedDocument(document.id);
				return;
			}

			if (
				failed?.item.payload.action === PageVerificationAction.CORRECT &&
				failed.item.payload.text !== undefined
			) {
				setEditConflictDraft({
					pageNo: failed.item.pageNo,
					text: failed.item.payload.text,
				});
			}
		});
	}, [dispatch, goToCompletedDocument, document, pagesForStrip]);

	const handleVerify = useCallback(
		(action: PageVerificationActionValue, text?: string): boolean => {
			if (!currentPage || !document || isBeingRead) {
				return false;
			}

			const durationMs = Date.now() - pageStartedAtReference.current;
			let payload: VerifyPageRequestDto;

			if (currentPage.transcription) {
				payload = {
					action,
					durationMs,
					text: text ?? currentPage.transcription.text,
					transcriptionId: currentPage.transcription.id,
				};
			} else {
				if (
					currentPage.status !== PageStatus.FAILED ||
					action !== PageVerificationAction.CORRECT
				) {
					return false;
				}

				if (!text || text.trim() === "") {
					notification.info("Type the page text before saving");
					return false;
				}

				payload = { action, durationMs, text };
			}

			dispatch(
				pageActions.enqueueVerification({
					item: {
						documentId: document.id,
						pageId: currentPage.id,
						pageNo: currentPage.pageNo,
						payload,
					},
					pageCount: document.pageCount,
				}),
			);

			runVerificationQueue();
			return true;
		},
		[currentPage, dispatch, document, isBeingRead, runVerificationQueue],
	);

	const handleConfirm = useCallback(() => {
		handleVerify(PageVerificationAction.CONFIRM);
	}, [handleVerify]);

	const handleSkip = useCallback(() => {
		handleVerify(PageVerificationAction.SKIP);
	}, [handleVerify]);

	const handleUndo = useCallback((): void => {
		if (isVerificationQueueBusy && !isEditing) {
			notification.info("Wait until the queued actions are saved, then undo");
			return;
		}

		if (lastVerifiedPageId === null || isEditing) {
			return;
		}

		dispatch(pageActions.undoOptimistic({ pageId: lastVerifiedPageId }));
		void dispatch(pageActions.undoPage({ pageId: lastVerifiedPageId })).then(
			(result) => {
				if (result.type === pageActions.undoPage.rejected.type) {
					notification.error(
						"The undo could not be completed. The page state has been restored.",
					);
				}
			},
		);
	}, [dispatch, isEditing, isVerificationQueueBusy, lastVerifiedPageId]);

	const handleSaveEdit = useCallback(
		(text: string): void => {
			if (text.trim() === "") {
				notification.info("Type the page text before saving");
				return;
			}

			const isQueued = handleVerify(PageVerificationAction.CORRECT, text);

			if (isQueued) {
				setEditConflictDraft(null);
			}
		},
		[handleVerify],
	);

	const handleReRead = useCallback((): void => {
		if (!currentPage || !document) {
			return;
		}

		const documentId = document.id;

		void dispatch(pageActions.reprocessPage({ pageId: currentPage.id }))
			.unwrap()
			.then(() => dispatch(documentActions.pollDocumentById(documentId)))
			.catch(() => null);
	}, [currentPage, dispatch, document]);

	const handleToggleEdit = useCallback((): void => {
		const canEdit =
			!isBeingRead &&
			(Boolean(currentPage?.transcription) ||
				currentPage?.status === PageStatus.FAILED);

		if (canEdit && !isReprocessing) {
			setIsEditing((value) => !value);
		}
	}, [currentPage, isBeingRead, isReprocessing]);

	const handlePageSelect = useCallback(
		(pageNo: number): void => {
			if (isEditing) {
				notification.info("Navigation is not available in edit mode");
				return;
			}
			dispatch(pageActions.setCursorPageNo(pageNo));
		},
		[dispatch, isEditing],
	);

	const handlePrevious = useCallback((): void => {
		if (cursorPageNo > MIN_NUMBER_OF_PAGES) {
			handlePageSelect(cursorPageNo - PAGE_STEP);
		}
	}, [cursorPageNo, handlePageSelect]);

	const handleNext = useCallback((): void => {
		if (document && cursorPageNo < document.pageCount) {
			handlePageSelect(cursorPageNo + PAGE_STEP);
		}
	}, [cursorPageNo, handlePageSelect, document]);

	useVerificationKeyboard({
		onCloseShortcuts: handleCloseShortcuts,
		onConfirm: handleConfirm,
		onEdit: handleToggleEdit,
		onPrevious: handlePrevious,
		onSkip: handleSkip,
		onToggleShortcuts: handleToggleShortcuts,
		onToggleZoom: toggleZoom,
		onUndo: handleUndo,
	});

	if (isDocumentLoading || !document) {
		return <LoaderOverlay label="Loading verification" />;
	}

	return (
		<div className="verification">
			<VerificationHeader
				document={document}
				isBudgetStopped={isBudgetStopped}
				pageNo={currentPage?.pageNo}
			/>
			<VerificationWorkspace
				currentPage={currentPage}
				document={document}
				editConflictDraft={editConflictDraft}
				isBudgetStopped={isBudgetStopped}
				isCompleted={isLastPage}
				isEditing={isEditing}
				isPaused={isPaused}
				isReprocessing={isReprocessing}
				isToggleDisabled={isToggleDisabled}
				isToggleVisible={isToggleVisible}
				isZoomed={isZoomed}
				onConfirm={handleConfirm}
				onReprocess={handleReRead}
				onReRead={handleReRead}
				onSaveEdit={handleSaveEdit}
				onSkip={handleSkip}
				onToggleEdit={handleToggleEdit}
				onToggleProcessing={onToggleProcessing}
				scanRef={scanRef}
				zoom={zoom}
			/>
			<VerificationFooter
				currentPageNo={cursorPageNo}
				cursorPageNo={verificationCursorPageNo}
				isLoading={isPagesLoading}
				onNext={handleNext}
				onPageSelect={handlePageSelect}
				onPrevious={handlePrevious}
				pageCount={document.pageCount}
				pages={pagesForStrip}
			/>
			{isShortcutsOpen && (
				<VerificationShortcutsDialog onClose={handleCloseShortcuts} />
			)}
		</div>
	);
};

export { Verification };
