import {
	BYTES_IN_KILOBYTE,
	configureString,
	DocumentStatus,
	DocumentValidationRule,
	KILOBYTES_IN_MEGABYTE,
} from "@transcripta/shared";
import { useState } from "react";

import {
	Button,
	ConfirmDialog,
	Link,
	LoaderOverlay,
	OverflowMenu,
	StatusChip,
	ThemeToggle,
} from "~/libs/components/components.js";
import { AppRoute, DataStatus } from "~/libs/enums/enums.js";
import { formatMoney } from "~/libs/helpers/helpers.js";
import {
	useAppDispatch,
	useAppSelector,
	useCallback,
	useEffect,
	useNavigate,
} from "~/libs/hooks/hooks.js";
import { actions as documentActions } from "~/modules/documents/documents.js";
import {
	DEFAULT_MAX_ARCHIVE_SIZE_MB,
	DEFAULT_MAX_PAGES,
} from "~/pages/document-new/libs/constants/constants.js";

import { EMPTY_LENGTH } from "./libs/constants/empty-length.constant.js";
import styles from "./styles.module.css";

const DEFAULT_MAX_FILE_SIZE_MB =
	DocumentValidationRule.MAX_FILE_BYTES /
	(BYTES_IN_KILOBYTE * KILOBYTES_IN_MEGABYTE);

const Documents: React.FC = () => {
	const dispatch = useAppDispatch();
	const navigate = useNavigate();
	const { dataStatus, documents } = useAppSelector(({ documents }) => ({
		dataStatus: documents.dataStatus,
		documents: documents.documents,
	}));
	const [pendingDeleteId, setPendingDeleteId] = useState<null | number>(null);

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
			event.preventDefault();

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

	const isLoading = dataStatus === DataStatus.PENDING;
	const isEmpty =
		dataStatus === DataStatus.FULFILLED && documents.length === EMPTY_LENGTH;
	const failedDocuments = documents.filter(
		(document) => document.status === DocumentStatus.FAILED,
	);
	const hasFailedDocuments = failedDocuments.length > EMPTY_LENGTH;
	const budgetStoppedDocuments = documents.filter(
		(document) => document.status === DocumentStatus.BUDGET_STOP,
	);
	const hasBudgetStoppedDocuments =
		budgetStoppedDocuments.length > EMPTY_LENGTH;
	const footerMessage = [
		hasBudgetStoppedDocuments &&
			`${budgetStoppedDocuments.map((document) => document.title).join(", ")} stopped at its budget — raise the limit to continue.`,
		hasFailedDocuments &&
			`${failedDocuments.map((document) => document.title).join(", ")} has failed pages — open it to re-read them.`,
	]
		.filter(Boolean)
		.join(" ");

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

	return (
		<div className={styles["documents-page"]}>
			{isLoading && <LoaderOverlay label="Loading documents" />}

			<header className={styles["documents-page__header"]}>
				<h1 className={styles["documents-page__title"]}>Documents</h1>

				<div className={styles["documents-page__actions"]}>
					<ThemeToggle />
					<Button
						className={styles["documents-page__new-btn"]}
						isPrimary
						label="+ New document"
						onClick={handleNewDocument}
					/>
				</div>
			</header>

			<main className={styles["documents-page__main"]}>
				{isEmpty && (
					<div className={styles["documents-page__empty"]}>
						<h2 className={styles["documents-page__empty-title"]}>
							No documents yet
						</h2>
						<p className={styles["documents-page__empty-description"]}>
							Upload a PDF and start verifying in about a minute.
						</p>
						<p className={styles["documents-page__empty-meta"]}>
							PDFs up to {DEFAULT_MAX_FILE_SIZE_MB} MB, ZIPs up to{" "}
							{DEFAULT_MAX_ARCHIVE_SIZE_MB} MB, up to {DEFAULT_MAX_PAGES} pages
						</p>
					</div>
				)}

				{!isEmpty && (
					<div
						aria-label="Documents"
						className={["tx-table", styles["documents-page__table"]]
							.filter(Boolean)
							.join(" ")}
						role="table"
					>
						<div role="row">
							<span role="columnheader">Title</span>
							<span role="columnheader">Status</span>
							<span
								className={styles["documents-page__num-header"]}
								role="columnheader"
							>
								Progress
							</span>
							<span
								className={styles["documents-page__num-header"]}
								role="columnheader"
							>
								Spent
							</span>
							<span role="columnheader" />
						</div>

						{documents.map((document) => {
							const handleDeleteClick = (): void => {
								setPendingDeleteId(document.id);
							};

							const isDraft = document.status === DocumentStatus.DRAFT;
							const rowRoute = isDraft
								? AppRoute.DOCUMENTS_NEW
								: configureString(AppRoute.DOCUMENT, {
										id: String(document.id),
									});

							const rowState = isDraft
								? { documentId: document.id }
								: undefined;

							const progressCursor =
								document.pageCount === EMPTY_LENGTH
									? EMPTY_LENGTH
									: document.cursorPageNo;

							return (
								<div
									data-document-id={document.id}
									key={document.id}
									role="row"
								>
									<Link
										className={styles["documents-page__row"] ?? ""}
										onKeyDown={handleRowKeyDown}
										state={rowState}
										to={rowRoute}
									>
										<span
											className={styles["documents-page__title-cell"]}
											role="cell"
										>
											<span className={styles["documents-page__title-text"]}>
												{document.title}
											</span>
										</span>
										<span
											className={styles["documents-page__status-cell"]}
											role="cell"
										>
											<StatusChip status={document.status} />

											{document.status === DocumentStatus.FAILED && (
												<Button
													className={styles["documents-page__reread-link"]}
													label="Open to re-read failed pages"
													onClick={handleRowActionClick}
												/>
											)}
											{document.status === DocumentStatus.BUDGET_STOP && (
												<Button
													isSecondary
													isSmall
													label="Raise the limit"
													onClick={handleRowActionClick}
												/>
											)}
										</span>
										<span className="tx-num" role="cell">
											{progressCursor} / {document.pageCount}
										</span>
										<span className="tx-num" role="cell">
											{formatMoney(document.spentUsd)} /{" "}
											{formatMoney(document.budgetUsd)}
										</span>
									</Link>
									<span role="cell">
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
						})}
					</div>
				)}

				{!isEmpty && (
					<div className={styles["documents-page__footer"]}>
						{(hasFailedDocuments || hasBudgetStoppedDocuments) && (
							<div className={styles["documents-page__footer-messages"]}>
								<p className={styles["documents-page__footer-message"]}>
									{footerMessage}
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
		</div>
	);
};

export { Documents };
