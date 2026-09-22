import { LoaderOverlay } from "~/libs/components/components.js";
import {
	DataStatus,
	HTTPCode,
	PageVerificationAction,
} from "~/libs/enums/enums.js";
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
import {
	actions as pageActions,
	selectCurrentPage,
	selectCursorPageNo,
	selectLastVerifiedPageId,
	selectPagesDataStatus,
	selectPagesForStrip,
	selectReprocessingPageId,
	selectVerificationDataStatus,
	type VerifyPageRequestDto,
} from "~/modules/pages/pages.js";

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
import { getPagesFrom } from "./libs/helpers/get-pages-from.helper.js";
import "./verification.css";
import { useVerificationKeyboard } from "./libs/hooks/use-verification-keyboard.hook.js";
import {
	type EditConflictDraft,
	type PageVerificationActionValue,
} from "./libs/types/types.js";

const Verification: React.FC = () => {
	const dispatch = useAppDispatch();
	const { id } = useParams();

	const [isEditing, setIsEditing] = useState(false);
	const [isZoomed, setIsZoomed] = useState(false);
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
	const verificationDataStatus = useAppSelector(selectVerificationDataStatus);
	const reprocessingPageId = useAppSelector(selectReprocessingPageId);

	const isVerifying = verificationDataStatus === DataStatus.PENDING;
	const isReprocessing =
		currentPage !== undefined && reprocessingPageId === currentPage.id;
	const isDocumentLoading = documentDataStatus === DataStatus.PENDING;
	const isPagesLoading = pagesDataStatus === DataStatus.PENDING;

	let isLastPage = false;

	if (document) {
		isLastPage = cursorPageNo >= document.pageCount;
	}

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
		if (!document) {
			return;
		}

		dispatch(pageActions.setCursorPageNo(document.cursorPageNo));
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

	const reloadPage = useCallback(
		(pageNo: number): void => {
			if (!document) {
				return;
			}

			void dispatch(
				pageActions.loadPages({
					documentId: document.id,
					query: {
						from: pageNo,
						limit: MAX_LOADED_PAGES,
					},
				}),
			);
		},
		[dispatch, document],
	);

	const handleVerify = useCallback(
		async (
			action: PageVerificationActionValue,
			text?: string,
		): Promise<boolean> => {
			if (!currentPage?.transcription || !document || isVerifying) {
				return false;
			}

			const pageNo = currentPage.pageNo;

			const payload: VerifyPageRequestDto = {
				action,
				durationMs: Date.now() - pageStartedAtReference.current,
				text: text ?? currentPage.transcription.text,
				transcriptionId: currentPage.transcription.id,
			};

			dispatch(
				pageActions.verifyOptimistic({
					pageCount: document.pageCount,
					pageId: currentPage.id,
					payload,
				}),
			);

			const result = await dispatch(
				pageActions.verifyPage({
					pageId: currentPage.id,
					payload,
				}),
			);

			const isRejected = pageActions.verifyPage.rejected.match(result);

			if (
				isRejected &&
				"status" in result.error &&
				result.error.status === HTTPCode.CONFLICT
			) {
				if (action === PageVerificationAction.CORRECT && text !== undefined) {
					setEditConflictDraft({
						pageNo,
						text,
					});
				}

				notification.error(
					"The verification could not be completed. The latest page version has been loaded.",
				);

				reloadPage(pageNo);
			}

			return !isRejected;
		},
		[currentPage, dispatch, document, reloadPage, isVerifying],
	);

	const handleConfirm = useCallback((): void => {
		void handleVerify(PageVerificationAction.CONFIRM);
	}, [handleVerify]);

	const handleSkip = useCallback((): void => {
		void handleVerify(PageVerificationAction.SKIP);
	}, [handleVerify]);

	const handleUndo = useCallback((): void => {
		if (lastVerifiedPageId === null || isVerifying || isEditing) {
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
	}, [dispatch, isEditing, isVerifying, lastVerifiedPageId]);

	const handleSaveEdit = useCallback(
		(text: string): void => {
			void (async (): Promise<void> => {
				const success = await handleVerify(
					PageVerificationAction.CORRECT,
					text,
				);

				if (success) {
					setEditConflictDraft(null);
				} else {
					setIsEditing(true);
				}
			})();
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
		if (!currentPage?.transcription || isVerifying) {
			return;
		}

		setIsEditing((value) => !value);
	}, [currentPage, isVerifying]);

	const handleToggleShortcuts = useCallback((): void => {
		setIsShortcutsOpen((value) => !value);
	}, []);

	const handleToggleZoom = useCallback((): void => {
		setIsZoomed((value) => !value);
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
		onToggleZoom: handleToggleZoom,
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
				isCompleted={isLastPage}
				isEditing={isEditing}
				isPauseDisabled={document.status !== DocumentStatus.PROCESSING}
				isReprocessing={isReprocessing}
				isVerifying={isVerifying}
				isZoomed={isZoomed}
				onConfirm={handleConfirm}
				onPause={handlePause}
				onReRead={handleReRead}
				onSaveEdit={handleSaveEdit}
				onSkip={handleSkip}
				onToggleEdit={handleToggleEdit}
				pageCount={document.pageCount}
			/>
			<VerificationFooter
				currentPageNo={cursorPageNo}
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
