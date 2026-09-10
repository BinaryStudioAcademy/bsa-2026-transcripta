import { LoaderOverlay } from "~/libs/components/components.js";
import { MAX_LOADED_PAGES } from "~/libs/constants/varification.constants.js";
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
import { actions as documentActions } from "~/modules/documents/documents.js";
import {
	actions as pageActions,
	selectCurrentPage,
	selectCursorPageNo,
	selectPagesDataStatus,
	selectPagesForStrip,
	VerifyPageRequestDto,
} from "~/modules/pages/pages.js";

import {
	VerificationFooter,
	VerificationHeader,
	VerificationShortcutsDialog,
	VerificationWorkspace,
} from "./libs/components/components.js";
import { useVerificationKeyboard } from "./libs/hooks/use-verification-keyboard.hook.js";
import "./verification.css";
import { type PageVerificationActionValue } from "./libs/types/types.js";

const Verification: React.FC = () => {
	const dispatch = useAppDispatch();
	const { id } = useParams();

	const [isEditing, setIsEditing] = useState(false);
	const [isZoomed, setIsZoomed] = useState(false);
	const [isShortcutsOpen, setIsShortcutsOpen] = useState(false);

	const pageStartedAtReference = useRef(Date.now());

	const { document, documentDataStatus } = useAppSelector(({ documents }) => ({
		document: documents.document,
		documentDataStatus: documents.documentDataStatus,
	}));

	const currentPage = useAppSelector(selectCurrentPage);
	const pagesDataStatus = useAppSelector(selectPagesDataStatus);
	const pagesForStrip = useAppSelector(selectPagesForStrip);
	const cursorPageNo = useAppSelector(selectCursorPageNo);

	useEffect(() => {
		const documentId = Number(id);

		if (!Number.isFinite(documentId)) {
			return;
		}

		void dispatch(documentActions.loadById(documentId));
	}, [id, dispatch]);

	useEffect(() => {
		if (!document) {
			return;
		}

		void dispatch(
			pageActions.loadPages({
				documentId: document.id,
				query: {
					from: document.cursorPageNo,
					limit: MAX_LOADED_PAGES,
				},
			}),
		);
	}, [document?.id, document?.cursorPageNo, dispatch]);

	useEffect(() => {
		if (currentPage) {
			pageStartedAtReference.current = Date.now();
		}
	}, [currentPage?.id]);

	const handleVerify = useCallback(
		(action: PageVerificationActionValue): void => {
			if (!currentPage?.transcription) {
				return;
			}

			const durationMs = Date.now() - pageStartedAtReference.current;

			const payload: VerifyPageRequestDto = {
				action,
				durationMs,
				text: currentPage.transcription.text,
				transcriptionId: currentPage.transcription.id,
			};

			dispatch(
				pageActions.verifyOptimistic({
					pageId: currentPage.id,
					payload,
				}),
			);

			void dispatch(
				pageActions.verifyPage({
					pageId: currentPage.id,
					payload,
				}),
			);
		},
		[currentPage, dispatch],
	);

	const handleConfirm = useCallback((): void => {
		handleVerify(PageVerificationAction.CONFIRM);
	}, [handleVerify]);

	const handleSkip = useCallback((): void => {
		handleVerify(PageVerificationAction.SKIP);
	}, [handleVerify]);

	const handleToggleEdit = useCallback((): void => {
		setIsEditing((value) => !value);
	}, []);

	const handleToggleShortcuts = useCallback((): void => {
		setIsShortcutsOpen((value) => !value);
	}, []);

	const handleToggleZoom = useCallback((): void => {
		setIsZoomed((value) => !value);
	}, []);

	useVerificationKeyboard({
		onConfirm: handleConfirm,
		onSkip: handleSkip,
		onToggleShortcuts: handleToggleShortcuts,
		onToggleZoom: handleToggleZoom,
	});

	const isLoading =
		documentDataStatus === DataStatus.PENDING ||
		pagesDataStatus === DataStatus.PENDING;

	if (isLoading) {
		return <LoaderOverlay label="Loading verification" />;
	}

	return (
		<div className="verification">
			<VerificationHeader
				budgetLimit={document?.budget.limitUsd}
				budgetSpent={document?.budget.spentUsd}
				documentTitle={document?.title}
				pageCount={document?.pageCount}
				pageNo={currentPage?.pageNo}
			/>

			<VerificationWorkspace
				currentPage={currentPage}
				isEditing={isEditing}
				isZoomed={isZoomed}
				onConfirm={handleConfirm}
				onSkip={handleSkip}
				onToggleEdit={handleToggleEdit}
				pageCount={document?.pageCount}
			/>

			<VerificationFooter currentPageNo={cursorPageNo} pages={pagesForStrip} />

			{isShortcutsOpen && (
				<VerificationShortcutsDialog onClose={handleToggleShortcuts} />
			)}
		</div>
	);
};

export { Verification };
