import {
	configureString,
	type DocumentGetAllItemResponseDto,
	DocumentStatus,
} from "@transcripta/shared";
import React, { useState } from "react";

import {
	Button,
	ConfirmDialog,
	Link,
	Loader,
	LoaderOverlay,
	OverflowMenu,
	RaiseLimitDialog,
	StatusChip,
	ThemeToggle,
} from "~/libs/components/components.js";
import { ONE_QUANTITY } from "~/libs/constants/common.constants.js";
import { BUDGET_UPLOAD_FAILED_MESSAGE } from "~/libs/constants/constants.js";
import { AppRoute, DataStatus, LoaderSize } from "~/libs/enums/enums.js";
import { formatMoney } from "~/libs/helpers/helpers.js";
import {
	useAppDispatch,
	useAppSelector,
	useCallback,
	useEffect,
	useNavigate,
	useOverflowTooltip,
} from "~/libs/hooks/hooks.js";
import { notification } from "~/libs/modules/notification/notification.js";
import { actions as documentActions } from "~/modules/documents/documents.js";

import { DocumentsEmptyState } from "./libs/components/documents-empty-state/documents-empty-state.js";
import { EMPTY_LENGTH } from "./libs/constants/empty-length.constant.js";
import styles from "./styles.module.css";

type TitleCellProperties = {
	title: string;
};

const DocumentTitleCell: React.FC<TitleCellProperties> = ({
	title,
}: TitleCellProperties) => {
	const { checkTruncation, elementReference, isTruncated } =
		useOverflowTooltip<HTMLSpanElement>(title);

	return (
		<span
			className={[
				styles["documents-page__title-wrapper"],
				isTruncated && "tx-tip",
			]
				.filter(Boolean)
				.join(" ")}
			data-tip={isTruncated ? title : undefined}
			onMouseEnter={checkTruncation}
		>
			<span
				className={styles["documents-page__title-text"]}
				ref={elementReference}
			>
				{title}
			</span>
		</span>
	);
};

const DocumentFooterTitle: React.FC<TitleCellProperties> = ({
	title,
}: TitleCellProperties) => {
	const { checkTruncation, elementReference, isTruncated } =
		useOverflowTooltip<HTMLSpanElement>(title);

	return (
		<span
			className={[
				styles["documents-page__footer-title-wrapper"],
				isTruncated && "tx-tip",
			]
				.filter(Boolean)
				.join(" ")}
			data-tip={isTruncated ? title : undefined}
			onMouseEnter={checkTruncation}
		>
			<span
				className={styles["documents-page__footer-title"]}
				ref={elementReference}
			>
				{title}
			</span>
		</span>
	);
};

type DocumentRowProperties = {
	document: DocumentGetAllItemResponseDto;
	onDeleteClick: (id: number) => void;
	onRaiseLimitClick: (event: React.MouseEvent<HTMLButtonElement>) => void;
	onRowActionClick: (event: React.MouseEvent<HTMLButtonElement>) => void;
	onRowKeyDown: (event: React.KeyboardEvent<HTMLAnchorElement>) => void;
};

const DocumentRow: React.FC<DocumentRowProperties> = ({
	document,
	onDeleteClick,
	onRaiseLimitClick,
	onRowActionClick,
	onRowKeyDown,
}: DocumentRowProperties) => {
	const handleDeleteClick = useCallback((): void => {
		onDeleteClick(document.id);
	}, [document.id, onDeleteClick]);

	const isDraft = document.status === DocumentStatus.DRAFT;
	const rowRoute = isDraft
		? AppRoute.DOCUMENTS_NEW
		: configureString(AppRoute.DOCUMENT, {
				id: String(document.id),
			});

	const rowState = isDraft ? { documentId: document.id } : undefined;

	const progressCursor =
		document.pageCount === EMPTY_LENGTH
			? EMPTY_LENGTH
			: Math.min(document.cursorPageNo, document.pageCount);

	return (
		<div className="tx-table__row" data-document-id={document.id} role="row">
			<div className={styles["documents-page__row"]}>
				<span
					className={["tx-table__cell", styles["documents-page__title-cell"]]
						.filter(Boolean)
						.join(" ")}
					role="cell"
				>
					<Link
						className={styles["documents-page__row-link"] ?? ""}
						onKeyDown={onRowKeyDown}
						state={rowState}
						to={rowRoute}
					>
						<DocumentTitleCell title={document.title} />
					</Link>
				</span>
				<span
					className={["tx-table__cell", styles["documents-page__status-cell"]]
						.filter(Boolean)
						.join(" ")}
					role="cell"
				>
					<StatusChip status={document.status} />

					{document.status !== DocumentStatus.FAILED &&
						document.pagesFailed > EMPTY_LENGTH && (
							<Button
								className={[
									styles["documents-page__row-action"],
									styles["documents-page__reread-link"],
								]
									.filter(Boolean)
									.join(" ")}
								label="Open to re-read failed pages"
								onClick={onRowActionClick}
							/>
						)}
					{document.status === DocumentStatus.BUDGET_STOP && (
						<Button
							className={styles["documents-page__row-action"]}
							isSecondary
							isSmall
							label="Raise the limit"
							onClick={onRaiseLimitClick}
						/>
					)}
				</span>
				<span className="tx-table__cell tx-num" role="cell">
					{progressCursor} / {document.pageCount}
				</span>
				<span className="tx-table__cell tx-num" role="cell">
					{formatMoney(document.spentUsd)} / {formatMoney(document.budgetUsd)}
				</span>
			</div>
			<span className="tx-table__cell" role="cell">
				<OverflowMenu
					items={[
						{
							isDanger: true,
							label: "Delete",
							onClick: handleDeleteClick,
						},
					]}
				/>
			</span>
		</div>
	);
};

const Documents: React.FC = () => {
	const dispatch = useAppDispatch();
	const navigate = useNavigate();
	const { dataStatus, documents } = useAppSelector(({ documents }) => ({
		dataStatus: documents.dataStatus,
		documents: documents.documents,
	}));
	const [pendingDeleteId, setPendingDeleteId] = useState<null | number>(null);
	const [budgetDocumentId, setBudgetDocumentId] = useState<null | number>(null);
	const [isUpdatingBudget, setIsUpdatingBudget] = useState(false);

	useEffect(() => {
		void dispatch(documentActions.loadAll());
	}, [dispatch]);

	const handleNewDocument = useCallback((): void => {
		void (async (): Promise<void> => {
			await navigate(AppRoute.DOCUMENTS_NEW);
		})();
	}, [navigate]);

	const handleRowActionClick = useCallback(
		(event: React.MouseEvent<HTMLButtonElement>): void => {
			const documentId = event.currentTarget
				.closest("[role=row]")
				?.getAttribute("data-document-id");

			if (!documentId) {
				return;
			}

			void (async (): Promise<void> => {
				await navigate(configureString(AppRoute.DOCUMENT, { id: documentId }));
			})();
		},
		[navigate],
	);

	const handleRowKeyDown = useCallback(
		(event: React.KeyboardEvent<HTMLAnchorElement>): void => {
			if (event.key !== "ArrowDown" && event.key !== "ArrowUp") {
				return;
			}

			event.preventDefault();

			const currentRow = event.currentTarget.closest("[role=row]");
			const targetRow =
				event.key === "ArrowDown"
					? currentRow?.nextElementSibling
					: currentRow?.previousElementSibling;
			const targetLink = targetRow?.querySelector<HTMLAnchorElement>("a");

			targetLink?.focus();
		},
		[],
	);

	const isLoading =
		dataStatus === DataStatus.PENDING && documents.length === EMPTY_LENGTH;
	const isRefreshing = dataStatus === DataStatus.PENDING && !isLoading;
	const isEmpty =
		dataStatus === DataStatus.FULFILLED && documents.length === EMPTY_LENGTH;
	const documentsWithFailedPages = documents.filter(
		(document) =>
			document.status !== DocumentStatus.FAILED &&
			document.pagesFailed > EMPTY_LENGTH,
	);
	const hasFailedPages = documentsWithFailedPages.length > EMPTY_LENGTH;
	const budgetStoppedDocuments = documents.filter(
		(document) => document.status === DocumentStatus.BUDGET_STOP,
	);
	const hasBudgetStoppedDocuments =
		budgetStoppedDocuments.length > EMPTY_LENGTH;

	const handleCancelDelete = useCallback((): void => {
		setPendingDeleteId(null);
	}, []);

	const handleConfirmDelete = useCallback((): void => {
		if (pendingDeleteId === null) {
			return;
		}

		void dispatch(documentActions.remove(pendingDeleteId));
		setPendingDeleteId(null);
	}, [dispatch, pendingDeleteId]);

	const handleCancelRaiseLimit = useCallback((): void => {
		setBudgetDocumentId(null);
	}, []);

	const handleUpdateBudget = useCallback(
		(limitUsd: string): void => {
			if (budgetDocumentId === null || isLoading || isUpdatingBudget) {
				return;
			}

			setIsUpdatingBudget(true);

			void dispatch(
				documentActions.updateBudget({
					id: budgetDocumentId,
					payload: { limitUsd },
				}),
			)
				.unwrap()
				.then(() => {
					setBudgetDocumentId(null);
					setIsUpdatingBudget(false);
					void dispatch(documentActions.loadAll());
				})
				.catch(() => {
					notification.error(BUDGET_UPLOAD_FAILED_MESSAGE);
					setIsUpdatingBudget(false);
				});
		},
		[budgetDocumentId, dispatch, isLoading, isUpdatingBudget],
	);

	const handleRaiseLimitClick = useCallback(
		(event: React.MouseEvent<HTMLButtonElement>): void => {
			const documentId = event.currentTarget
				.closest("[role=row]")
				?.getAttribute("data-document-id");

			if (!documentId) {
				return;
			}

			setBudgetDocumentId(Number(documentId));
		},
		[],
	);

	const activeBudgetDocument = documents.find(
		(document_) => document_.id === budgetDocumentId,
	);

	return (
		<div className={styles["documents-page"]}>
			{isLoading && <LoaderOverlay label="Loading documents" />}

			<header className={styles["documents-page__header"]}>
				<div className={styles["documents-page__heading"]}>
					<h1 className={styles["documents-page__title"]}>Documents</h1>

					{isRefreshing && (
						<Loader label="Refreshing documents" size={LoaderSize.SMALL} />
					)}
				</div>

				<div className={styles["documents-page__actions"]}>
					<Button
						className={styles["documents-page__new-btn"]}
						isPrimary
						label="+ New document"
						onClick={handleNewDocument}
					/>
					<ThemeToggle />
				</div>
			</header>

			<main className={styles["documents-page__main"]}>
				{isEmpty && <DocumentsEmptyState />}

				{!isEmpty && (
					<div
						aria-label="Documents"
						className={["tx-table", styles["documents-page__table"]]
							.filter(Boolean)
							.join(" ")}
						role="table"
					>
						<div className="tx-table__row" role="row">
							<span className="tx-table__columnheader" role="columnheader">
								Title
							</span>
							<span className="tx-table__columnheader" role="columnheader">
								Status
							</span>
							<span
								className={[
									"tx-table__columnheader",
									styles["documents-page__num-header"],
								]
									.filter(Boolean)
									.join(" ")}
								role="columnheader"
							>
								Progress
							</span>
							<span
								className={[
									"tx-table__columnheader",
									styles["documents-page__num-header"],
								]
									.filter(Boolean)
									.join(" ")}
								role="columnheader"
							>
								Spent
							</span>
							<span className="tx-table__columnheader" role="columnheader" />
						</div>

						{documents.map((document) => (
							<DocumentRow
								document={document}
								key={document.id}
								onDeleteClick={setPendingDeleteId}
								onRaiseLimitClick={handleRaiseLimitClick}
								onRowActionClick={handleRowActionClick}
								onRowKeyDown={handleRowKeyDown}
							/>
						))}
					</div>
				)}

				{!isEmpty && (
					<div className={styles["documents-page__footer"]}>
						{(hasFailedPages || hasBudgetStoppedDocuments) && (
							<div className={styles["documents-page__footer-messages"]}>
								<p className={styles["documents-page__footer-message"]}>
									{hasBudgetStoppedDocuments && (
										<>
											{budgetStoppedDocuments.map((document, index) => (
												<React.Fragment key={document.id}>
													{index > EMPTY_LENGTH && ", "}
													<DocumentFooterTitle title={document.title} />
												</React.Fragment>
											))}
											{" stopped at its budget — raise the limit to continue."}
										</>
									)}
									{hasBudgetStoppedDocuments && hasFailedPages && " "}
									{hasFailedPages && (
										<>
											{documentsWithFailedPages.map((document, index) => (
												<React.Fragment key={document.id}>
													{index > EMPTY_LENGTH && ", "}
													<DocumentFooterTitle title={document.title} />
													{` has ${String(document.pagesFailed)} failed ${
														document.pagesFailed === ONE_QUANTITY
															? "page"
															: "pages"
													}`}
												</React.Fragment>
											))}
											{" — open it to re-read them."}
										</>
									)}
								</p>
							</div>
						)}

						<span
							className={[
								"tx-kbdrow",
								styles["documents-page__footer-shortcuts"],
							]
								.filter(Boolean)
								.join(" ")}
						>
							<span>
								<span className="tx-kbd">↑</span>
								<span className="tx-kbd">↓</span>
								Select
							</span>
							<span>
								<span className="tx-kbd">Enter</span>
								Open
							</span>
						</span>
					</div>
				)}
			</main>

			{pendingDeleteId !== null && (
				<ConfirmDialog
					description="The transcription goes with it. This can't be undone."
					onCancel={handleCancelDelete}
					onConfirm={handleConfirmDelete}
					title="Delete this document"
				/>
			)}

			{budgetDocumentId !== null && activeBudgetDocument && (
				<RaiseLimitDialog
					currentLimitUsd={activeBudgetDocument.budgetUsd}
					onCancel={handleCancelRaiseLimit}
					onSubmit={handleUpdateBudget}
					spentUsd={activeBudgetDocument.spentUsd}
				/>
			)}
		</div>
	);
};

export { Documents };
