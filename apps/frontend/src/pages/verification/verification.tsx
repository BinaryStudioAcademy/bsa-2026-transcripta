import { Link, LoaderOverlay } from "~/libs/components/components.js";
import { AppRoute, DataStatus } from "~/libs/enums/enums.js";
import {
	useAppDispatch,
	useAppSelector,
	useCallback,
	useEffect,
	useParams,
	useState,
} from "~/libs/hooks/hooks.js";
import { actions as documentActions } from "~/modules/documents/documents.js";
import {
	actions as pageActions,
	selectCurrentPage,
	selectPagesDataStatus,
} from "~/modules/pages/pages.js";

import "./verification.css";

const Verification: React.FC = () => {
	const dispatch = useAppDispatch();
	const { id } = useParams();

	const [isEditing, setIsEditing] = useState(false);
	const [isZoomed] = useState(false);

	const { document, documentDataStatus } = useAppSelector(({ documents }) => ({
		document: documents.document,
		documentDataStatus: documents.documentDataStatus,
	}));

	const currentPage = useAppSelector(selectCurrentPage);
	const pagesDataStatus = useAppSelector(selectPagesDataStatus);

	const handleEditClick = useCallback((): void => {
		setIsEditing(true);
	}, []);

	const handleEditCancel = useCallback((): void => {
		setIsEditing(false);
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
					limit: 5,
				},
			}),
		);
	}, [document, dispatch]);

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
											<button className="tx-btn tx-btn--primary" type="button">
												Correct
											</button>

											<button
												className="tx-btn tx-btn--secondary"
												onClick={handleEditClick}
												type="button"
											>
												Edit
											</button>

											<button className="tx-btn tx-btn--ghost" type="button">
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
					<PageButton page={41} status="skipped" />
					<PageButton page={42} status="error" />
					<PageButton page={43} status="confirmed" />
					<PageButton page={44} status="confirmed" />
					<PageButton page={45} status="confirmed" />
					<PageButton page={46} status="corrected" />
					<PageButton page={47} status="current" />
					<PageButton page={48} status="ready" />
					<PageButton page={49} status="ready" />
					<PageButton page={50} status="running" />
					<PageButton page={51} status="queued" />
					<button aria-label="Next" className="tx-page" type="button">
						►
					</button>
				</div>

				<span className="tx-pstrip-legend">▓ ready ░ running · queued</span>
			</footer>
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
	page: number;
	status: PageStatus;
};

type PageStatus =
	| "confirmed"
	| "corrected"
	| "current"
	| "error"
	| "queued"
	| "ready"
	| "running"
	| "skipped";

const PageButton: React.FC<PageButtonProperties> = ({ page, status }) => {
	const statusSymbolMap: Record<PageStatus, string> = {
		confirmed: "✓",
		corrected: "✎",
		current: "●",
		error: "!",
		queued: "·",
		ready: "▓",
		running: "░",
		skipped: "↷",
	};

	const hasThumb = status !== "current";

	return (
		<button className={`tx-page tx-page--${status}`} type="button">
			{page}
			<span aria-hidden="true">{statusSymbolMap[status]}</span>

			{hasThumb && (
				<span aria-hidden="true" className="tx-page-thumb">
					<i />
					<i />
					<i />
					<i />
					<i />
					<i />
					<i />
					<i />
				</span>
			)}
		</button>
	);
};

export { Verification };
