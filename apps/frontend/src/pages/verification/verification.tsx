import { PageStatus, PageStatusValue } from "@transcripta/shared";

import { Link, LoaderOverlay } from "~/libs/components/components.js";
import { MAX_LOADED_PAGES } from "~/libs/constants/varification.constants.js";
import {
	AppRoute,
	DataStatus,
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

import "./verification.css";
import { actions as documentActions } from "~/modules/documents/documents.js";
import {
	actions as pageActions,
	selectCurrentPage,
	selectCursorPageNo,
	selectPagesDataStatus,
	selectPagesForStrip,
	VerifyPageRequestDto,
} from "~/modules/pages/pages.js";

const getPageStripStatus = (
	status: PageStatusValue,
	isCurrent: boolean,
): string => {
	if (isCurrent) {
		return "current";
	}

	switch (status) {
		case PageStatus.CONFIRMED: {
			return "confirmed";
		}

		case PageStatus.CORRECTED: {
			return "corrected";
		}

		case PageStatus.FAILED: {
			return "error";
		}

		case PageStatus.QUEUED: {
			return "queued";
		}

		case PageStatus.SKIPPED: {
			return "skipped";
		}

		case PageStatus.TRANSCRIBED: {
			return "ready";
		}
		case PageStatus.TRANSCRIBING: {
			return "running";
		}

		default: {
			return "ready";
		}
	}
};

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

	const handleEditClick = useCallback((): void => {
		setIsEditing(true);
	}, []);

	const handleEditCancel = useCallback((): void => {
		setIsEditing(false);
	}, []);

	const toggleShortcuts = useCallback((): void => {
		setIsShortcutsOpen((value) => !value);
	}, []);

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

	const handleConfirm = useCallback((): void => {
		if (!currentPage?.transcription) {
			return;
		}

		const durationMs = Date.now() - pageStartedAtReference.current;

		const payload: VerifyPageRequestDto = {
			action: PageVerificationAction.CONFIRM,
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
	}, [currentPage, dispatch]);

	const handleSkip = useCallback((): void => {
		if (!currentPage?.transcription) {
			return;
		}

		const durationMs = Date.now() - pageStartedAtReference.current;

		const payload: VerifyPageRequestDto = {
			action: PageVerificationAction.SKIP,
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
	}, [currentPage, dispatch]);

	useEffect(() => {
		const handleKeyUp = (event: KeyboardEvent): void => {
			const target = event.target;

			if (
				target instanceof HTMLInputElement ||
				target instanceof HTMLTextAreaElement ||
				target instanceof HTMLSelectElement ||
				(target instanceof HTMLElement && target.isContentEditable)
			) {
				return;
			}

			if (event.ctrlKey || event.metaKey || event.altKey) {
				return;
			}

			switch (event.key) {
				case " ": {
					event.preventDefault();
					setIsZoomed((value) => !value);
					break;
				}

				case "?": {
					toggleShortcuts();
					break;
				}

				case "ArrowRight": {
					handleConfirm();
					break;
				}

				case "Enter": {
					handleConfirm();
					break;
				}

				case "s": {
					handleSkip();
					break;
				}

				case "S": {
					handleSkip();
					break;
				}
			}
		};

		globalThis.addEventListener("keyup", handleKeyUp);

		return () => {
			globalThis.removeEventListener("keyup", handleKeyUp);
		};
	}, [handleConfirm, handleSkip, toggleShortcuts]);

	const isLoading =
		documentDataStatus === DataStatus.PENDING ||
		pagesDataStatus === DataStatus.PENDING;

	if (isLoading) {
		return <LoaderOverlay label="Loading verification" />;
	}

	return (
		<div className="verification">
			<header className="verification-header">
				<Link className="verification-header__back" to={AppRoute.DOCUMENTS}>
					← Documents
				</Link>

				{document && (
					<strong className="verification-header__title">
						{document.title}
					</strong>
				)}

				{currentPage && document && (
					<span className="verification-header__page">
						page {currentPage.pageNo} of {document.pageCount}
					</span>
				)}

				<div className="verification-header__spacer" />

				<div className="verification-header__shortcuts">
					<span className="tx-kbdrow">
						<span>
							<kbd className="tx-kbd">Enter</kbd>Correct
						</span>
						<span>
							<kbd className="tx-kbd">E</kbd>Edit
						</span>
						<span>
							<kbd className="tx-kbd">S</kbd>Skip
						</span>
						<span>
							<kbd className="tx-kbd">?</kbd>Shortcuts
						</span>
					</span>
				</div>

				<div className="verification-header__queue">
					<span className="tx-chip">
						<span className="verification-header__queue-count">3</span>
						unsaved actions
					</span>
				</div>

				<div className="verification-header__budget">
					<span className="tx-budget">
						<span className="tx-budget-bar">
							<i />
						</span>
						${document?.budget.spentUsd} / ${document?.budget.limitUsd}
					</span>
				</div>

				<button className="tx-btn tx-btn--ghost tx-btn--sm" type="button">
					Night
				</button>
			</header>

			<div className="tx-split verification-workspace">
				<div className="tx-split-pane verification-scan-pane">
					<div className="verification-scan">
						<span className="verification-scan__placeholder-label">
							scan placeholder
						</span>

						<div
							className={`verification-scan__content ${
								isZoomed ? "verification-scan__content--zoomed" : ""
							}`}
						>
							{currentPage?.imageUrl ? (
								<img
									alt={`Page ${String(currentPage.pageNo)}`}
									className="verification-scan__image"
									src={currentPage.imageUrl}
								/>
							) : (
								<div className="verification-scan__text">No scan available</div>
							)}
						</div>
					</div>
				</div>

				<div className="tx-split-divider">
					<span className="tx-split-grip" />
				</div>

				<div className="tx-split-pane">
					<section className="verification-transcription">
						{currentPage?.transcription ? (
							<>
								<span className="verification-transcription__page">
									page {currentPage.pageNo} of {document?.pageCount}
									{isEditing && " · editing"}
								</span>

								{isEditing ? (
									<EditMode
										onCancel={handleEditCancel}
										text={currentPage.transcription.text}
									/>
								) : (
									<>
										<p className="verification-transcription__text">
											{currentPage.transcription.text}
										</p>

										<div className="verification-actions">
											<button
												className="tx-btn tx-btn--primary"
												onClick={handleConfirm}
												type="button"
											>
												Correct
											</button>

											<button
												className="tx-btn tx-btn--secondary"
												onClick={handleEditClick}
												type="button"
											>
												Edit
											</button>

											<button
												className="tx-btn tx-btn--ghost"
												onClick={handleSkip}
												type="button"
											>
												Skip
											</button>
										</div>
									</>
								)}
							</>
						) : (
							<div className="verification-empty-state">
								<h3>Preparing the next page</h3>
								<p>
									Everything ready has been verified; the model is still
									reading.
								</p>
							</div>
						)}
					</section>
				</div>
			</div>

			<footer className="verification-footer">
				<div className="tx-pstrip">
					<button aria-label="Previous" className="tx-page" type="button">
						◄
					</button>
					{pagesForStrip.map((page) => {
						if (!page) {
							return;
						}

						const isCurrent = page.pageNo === cursorPageNo;

						return (
							<PageButton
								isCurrent={isCurrent}
								key={page.id}
								page={page.pageNo}
								status={getPageStripStatus(page.status, isCurrent)}
							/>
						);
					})}

					<button aria-label="Next" className="tx-page" type="button">
						►
					</button>
				</div>

				<span className="tx-pstrip-legend">▓ ready ░ running · queued</span>
			</footer>
			{isShortcutsOpen && (
				<div className="tx-scrim">
					<div className="tx-dialog">
						<h2 className="tx-dialog-title">Keyboard shortcuts</h2>

						<div className="tx-dialog-shortcuts">
							<span className="tx-dialog-shortcut-keys">
								<kbd className="tx-kbd">Enter</kbd>
								<kbd className="tx-kbd">→</kbd>
							</span>
							<span>Correct, next</span>

							<kbd className="tx-kbd">←</kbd>
							<span>Previous</span>

							<kbd className="tx-kbd">E</kbd>
							<span>Edit</span>

							<kbd className="tx-kbd">S</kbd>
							<span>Skip</span>

							<kbd className="tx-kbd">Ctrl+Z</kbd>
							<span>Undo</span>

							<kbd className="tx-kbd">Space</kbd>
							<span>Zoom</span>

							<kbd className="tx-kbd">?</kbd>
							<span>This list</span>
						</div>

						<div className="tx-dialog-actions">
							<button
								className="tx-btn tx-btn--secondary"
								onClick={toggleShortcuts}
								type="button"
							>
								Close
							</button>
						</div>
					</div>
				</div>
			)}
		</div>
	);
};

type EditModeProperties = {
	onCancel: () => void;
	text: string;
};

const EditMode: React.FC<EditModeProperties> = ({ onCancel, text }) => {
	const [value, setValue] = useState(text);

	const handleTextareaChange = useCallback(
		(event: React.ChangeEvent<HTMLTextAreaElement>): void => {
			setValue(event.target.value);
		},
		[],
	);

	return (
		<div className="verification-edit">
			<textarea
				className="tx-input verification-edit__textarea"
				onChange={handleTextareaChange}
				rows={5}
				value={value}
			/>

			<div className="verification-edit__actions">
				<button className="tx-btn tx-btn--primary" type="button">
					Save and next
				</button>

				<span>
					<kbd className="tx-kbd">Ctrl+Enter</kbd>
					{" — Save and next"}
				</span>

				<button
					className="tx-btn tx-btn--ghost"
					onClick={onCancel}
					type="button"
				>
					<kbd className="tx-kbd">Esc</kbd>
					{" — cancel"}
				</button>
			</div>
		</div>
	);
};

type PageButtonProperties = {
	isCurrent: boolean;
	page: number;
	status: string;
};

const PageButton: React.FC<PageButtonProperties> = ({
	isCurrent,
	page,
	status,
}) => {
	const statusSymbolMap: Record<string, string> = {
		confirmed: "✓",
		corrected: "✎",
		current: "●",
		error: "!",
		queued: "·",
		ready: "▓",
		running: "░",
		skipped: "↷",
	};

	const hasThumb = !isCurrent;

	return (
		<button className={`tx-page tx-page--${status}`} type="button">
			{page}
			<span aria-hidden="true">{statusSymbolMap[status]}</span>

			{hasThumb && <span aria-hidden="true" className="tx-page-thumb"></span>}
		</button>
	);
};

export { Verification };
