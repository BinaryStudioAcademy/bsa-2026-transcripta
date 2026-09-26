import { LoaderOverlay } from "~/libs/components/components.js";
import { INITIAL_COUNT } from "~/libs/constants/constants.js";
import { DataStatus, PageVerificationAction } from "~/libs/enums/enums.js";
import {
	useAppDispatch,
	useAppSelector,
	useCallback,
	useEffect,
	useParams,
	useRef,
	useState,
} from "~/libs/hooks/hooks.js";
import { notification } from "~/libs/modules/notification/notification.js";
import { actions as documentActions } from "~/modules/documents/documents.js";
import { DocumentStatus } from "~/modules/documents/libs/enums/enums.js";
import { PollingIntervalsMS } from "~/modules/documents/libs/enums/polling-intervals-ms.enums.js";
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
import { PageStatus } from "./libs/enums/enums.js";
import { getPagesFrom } from "./libs/helpers/get-pages-from.helper.js";
import { useScanZoom } from "./libs/hooks/use-scan-zoom.js";
import { useVerificationKeyboard } from "./libs/hooks/use-verification-keyboard.hook.js";
import {
	type EditConflictDraft,
	type PageVerificationActionValue,
} from "./libs/types/types.js";

const Verification: React.FC = () => {
	const dispatch = useAppDispatch();
	const { id } = useParams();

	const [isEditing, setIsEditing] = useState(false);
	const { isZoomed, scanRef, toggleZoom, zoom } = useScanZoom();
	const [isShortcutsOpen, setIsShortcutsOpen] = useState(false);
	const [editConflictDraft, setEditConflictDraft] =
		useState<EditConflictDraft | null>(null);

	const pageStartedAtReference = useRef(Date.now());

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

	const isLastPage = Boolean(document && cursorPageNo >= document.pageCount);

	useEffect(() => {
		const documentId = Number(id);

		if (!Number.isFinite(documentId)) {
			return;
		}

		dispatch(pageActions.reset());

		if (document && document.id === documentId) {
			return;
		}

		void dispatch(documentActions.loadById(documentId));
	}, [id, document, dispatch]);

	useEffect(() => {
		const documentId = Number(id);

		if (!Number.isFinite(documentId) || !document) {
			return;
		}

		if (currentPage?.transcription) {
			return;
		}

		const timeoutId = setInterval(() => {
			void dispatch(
				pageActions.loadPages({
					documentId,
					query: {
						from: cursorPageNo,
						limit: MAX_LOADED_PAGES,
					},
				}),
			);
		}, PollingIntervalsMS.DEFAULT);

		return () => {
			clearInterval(timeoutId);
		};
	}, [id, dispatch, currentPage?.transcription, cursorPageNo, document]);

	useEffect(() => {
		if (!document) {
			return;
		}

		const initialPageNo = Math.max(
			MIN_NUMBER_OF_PAGES,
			Math.min(
				document.cursorPageNo || MIN_NUMBER_OF_PAGES,
				document.pageCount || MIN_NUMBER_OF_PAGES,
			),
		);
		dispatch(pageActions.setCursorPageNo(initialPageNo));
	}, [document, dispatch]);

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

	const runVerificationQueue = useCallback((): void => {
		void dispatch(pageActions.processVerificationQueue()).then((result) => {
			const isFulfilled =
				pageActions.processVerificationQueue.fulfilled.match(result);

			if (!isFulfilled) {
				return;
			}

			const { failed } = result.payload;

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
	}, [dispatch]);

	const handleVerify = useCallback(
		(action: PageVerificationActionValue, text?: string): boolean => {
			if (!currentPage || !document) {
				return false;
			}

			const { transcription } = currentPage;
			const durationMs = Date.now() - pageStartedAtReference.current;

			let payload: VerifyPageRequestDto;

			if (transcription) {
				payload = {
					action,
					durationMs,
					text: text ?? transcription.text,
					transcriptionId: transcription.id,
				};
			} else {
				const isManualTranscription =
					currentPage.status === PageStatus.FAILED &&
					action === PageVerificationAction.CORRECT;

				if (!isManualTranscription) {
					return false;
				}

				if (text === undefined || text.trim() === "") {
					notification.info("Type the page text before saving");

					return false;
				}

				payload = {
					action,
					durationMs,
					text,
				};
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
		[currentPage, dispatch, document, runVerificationQueue],
	);

	const handleConfirm = useCallback((): void => {
		handleVerify(PageVerificationAction.CONFIRM);
	}, [handleVerify]);

	const handleSkip = useCallback((): void => {
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
				const isRejected = pageActions.undoPage.rejected.match(result);

				if (isRejected) {
					notification.error(
						"The undo could not be completed. The page state has been restored.",
					);
				}
			},
		);
	}, [dispatch, isEditing, isVerificationQueueBusy, lastVerifiedPageId]);

	const handleSaveEdit = useCallback(
		(text: string): void => {
			const isQueued = handleVerify(PageVerificationAction.CORRECT, text);

			if (isQueued) {
				setEditConflictDraft(null);
			}
		},
		[handleVerify],
	);

	const handleReRead = useCallback((): void => {
		if (!currentPage) {
			return;
		}

		void dispatch(pageActions.reprocessPage({ pageId: currentPage.id }));
	}, [currentPage, dispatch]);

	const handlePause = useCallback((): void => {
		if (!document) {
			return;
		}

		void dispatch(documentActions.pause(document.id));
	}, [dispatch, document]);

	const handleToggleEdit = useCallback((): void => {
		const canEdit =
			Boolean(currentPage?.transcription) ||
			currentPage?.status === PageStatus.FAILED;

		if (!canEdit || isReprocessing) {
			return;
		}

		setIsEditing((value) => !value);
	}, [currentPage, isReprocessing]);

	const handleToggleShortcuts = useCallback((): void => {
		setIsShortcutsOpen((value) => !value);
	}, []);

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
		if (cursorPageNo <= MIN_NUMBER_OF_PAGES) {
			return;
		}

		handlePageSelect(cursorPageNo - PAGE_STEP);
	}, [cursorPageNo, handlePageSelect]);

	const handleNext = useCallback((): void => {
		if (!document || cursorPageNo >= document.pageCount) {
			return;
		}

		handlePageSelect(cursorPageNo + PAGE_STEP);
	}, [cursorPageNo, handlePageSelect, document]);

	useVerificationKeyboard({
		onConfirm: handleConfirm,
		onEdit: handleToggleEdit,
		onPrevious: handlePrevious,
		onSkip: handleSkip,
		onToggleShortcuts: handleToggleShortcuts,
		onToggleZoom: toggleZoom,
		onUndo: handleUndo,
	});

	if (isDocumentLoading) {
		return <LoaderOverlay label="Loading verification" />;
	}

	if (!document) {
		return null;
	}

	return (
		<div className="verification">
			<VerificationHeader
				budgetLimit={document.budget.limitUsd}
				budgetSpent={document.budget.spentUsd}
				documentTitle={document.title}
				pageCount={document.pageCount}
				pageNo={currentPage?.pageNo}
			/>
			<VerificationWorkspace
				currentPage={currentPage}
				editConflictDraft={editConflictDraft}
				hasVerifiedPages={document.progress.pagesVerified > INITIAL_COUNT}
				isCompleted={isLastPage}
				isEditing={isEditing}
				isPauseDisabled={document.status !== DocumentStatus.PROCESSING}
				isReprocessing={isReprocessing}
				isZoomed={isZoomed}
				onConfirm={handleConfirm}
				onPause={handlePause}
				onReRead={handleReRead}
				onSaveEdit={handleSaveEdit}
				onSkip={handleSkip}
				onToggleEdit={handleToggleEdit}
				pageCount={document.pageCount}
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
				<VerificationShortcutsDialog onClose={handleToggleShortcuts} />
			)}
		</div>
	);
};

export { Verification };
