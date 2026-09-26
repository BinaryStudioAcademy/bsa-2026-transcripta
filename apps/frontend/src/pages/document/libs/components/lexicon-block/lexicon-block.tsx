import { type DocumentGetLexiconItemResponseDto } from "@transcripta/shared";
import { useState } from "react";

import { ONE_QUANTITY } from "~/libs/constants/common.constants.js";
import { INITIAL_COUNT } from "~/libs/constants/constants.js";
import { DataStatus } from "~/libs/enums/enums.js";
import {
	useAppDispatch,
	useAppSelector,
	useCallback,
	useEffect,
} from "~/libs/hooks/hooks.js";
import { notification } from "~/libs/modules/notification/notification.js";
import { actions as lexiconActions } from "~/modules/lexicon/lexicon.js";

import { DocumentSection } from "../document-section/document-section.js";
import { LexiconEntryRow } from "./lexicon-entry-row.js";
import { MarkWrongDialog } from "./mark-wrong-dialog.js";
import styles from "./styles.module.css";

type Properties = {
	documentId: number;
};

const LexiconBlock: React.FC<Properties> = ({ documentId }: Properties) => {
	const dispatch = useAppDispatch();
	const { invalidateDataStatus, items, loadDataStatus, loadedDocumentId } =
		useAppSelector(({ lexicon }) => ({
			invalidateDataStatus: lexicon.invalidateDataStatus,
			items: lexicon.items,
			loadDataStatus: lexicon.loadDataStatus,
			loadedDocumentId: lexicon.documentId,
		}));
	const [entryToInvalidate, setEntryToInvalidate] =
		useState<DocumentGetLexiconItemResponseDto | null>(null);

	const visibleItems = loadedDocumentId === documentId ? items : [];

	useEffect(() => {
		setEntryToInvalidate(null);
		void dispatch(lexiconActions.loadByDocumentId(documentId));
	}, [dispatch, documentId]);

	const handleOpenMarkWrong = useCallback(
		(entry: DocumentGetLexiconItemResponseDto): void => {
			setEntryToInvalidate(entry);
		},
		[],
	);

	const handleCancelMarkWrong = useCallback((): void => {
		setEntryToInvalidate(null);
	}, []);

	const handleConfirmMarkWrong = useCallback(
		(reason: string): void => {
			if (!entryToInvalidate) {
				return;
			}

			const word = entryToInvalidate.valueDisplay;

			void dispatch(
				lexiconActions.invalidate({
					id: entryToInvalidate.id,
					reason,
				}),
			)
				.unwrap()
				.then(() => {
					setEntryToInvalidate(null);
					notification.info(
						`“${word}” removed from the lexicon. Future pages will not use it.`,
					);
				})
				.catch(() => {
					setEntryToInvalidate(null);
				});
		},
		[dispatch, entryToInvalidate],
	);

	const isLoading =
		loadDataStatus === DataStatus.PENDING &&
		loadedDocumentId === documentId &&
		visibleItems.length === INITIAL_COUNT;
	const isEmpty =
		loadDataStatus === DataStatus.FULFILLED &&
		loadedDocumentId === documentId &&
		visibleItems.length === INITIAL_COUNT;
	const isInvalidating = invalidateDataStatus === DataStatus.PENDING;
	const wordsLabel = visibleItems.length === ONE_QUANTITY ? "word" : "words";

	return (
		<>
			<DocumentSection
				count={
					loadDataStatus === DataStatus.FULFILLED &&
					loadedDocumentId === documentId
						? `${String(visibleItems.length)} ${wordsLabel}`
						: undefined
				}
				title="Lexicon"
			>
				<p className={styles["note"]}>
					Words confirmed while verifying. Marking one wrong affects future
					pages only — verified pages keep their text.
				</p>

				{isLoading && <p className={styles["empty"]}>Loading lexicon…</p>}

				{isEmpty && (
					<p className={styles["empty"]}>
						No words yet. Confirmed words from verification will appear here.
					</p>
				)}

				{visibleItems.length > INITIAL_COUNT && (
					<ul className={styles["list"]}>
						{visibleItems.map((entry) => (
							<LexiconEntryRow
								entry={entry}
								isDisabled={isInvalidating}
								key={entry.id}
								onMarkWrong={handleOpenMarkWrong}
							/>
						))}
					</ul>
				)}
			</DocumentSection>

			{entryToInvalidate && (
				<MarkWrongDialog
					isSubmitting={isInvalidating}
					onCancel={handleCancelMarkWrong}
					onConfirm={handleConfirmMarkWrong}
					word={entryToInvalidate.valueDisplay}
				/>
			)}
		</>
	);
};

export { LexiconBlock };
