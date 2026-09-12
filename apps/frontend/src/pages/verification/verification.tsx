import { LoaderOverlay } from "~/libs/components/components.js";
import { MAX_LOADED_PAGES } from "~/libs/constants/varification.constants.js";
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

	const document = useAppSelector(({ documents }) => documents.document);

	const documentDataStatus = useAppSelector(
		({ documents }) => documents.documentDataStatus,
	);

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
	}, [document, dispatch]);

	useEffect(() => {
		if (currentPage) {
			pageStartedAtReference.current = Date.now();
		}
	}, [currentPage]);

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
		async (action: PageVerificationActionValue): Promise<void> => {
			if (!currentPage?.transcription || !document) {
				return;
			}

			const pageNo = currentPage.pageNo;

			const payload: VerifyPageRequestDto = {
				action,
				durationMs: Date.now() - pageStartedAtReference.current,
				text: currentPage.transcription.text,
				transcriptionId: currentPage.transcription.id,
			};

			dispatch(
				pageActions.verifyOptimistic({
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
				notification.error(
					"The verification could not be completed. The latest page version has been loaded.",
				);
				reloadPage(pageNo);
			}
		},
		[currentPage, dispatch, document, reloadPage],
	);

	const handleConfirm = useCallback((): void => {
		void handleVerify(PageVerificationAction.CONFIRM);
	}, [handleVerify]);

	const handleSkip = useCallback((): void => {
		void handleVerify(PageVerificationAction.SKIP);
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
		onEdit: handleToggleEdit,
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
