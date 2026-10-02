import { createAction, createAsyncThunk } from "@reduxjs/toolkit";

import {
	EMPTY_LENGTH,
	FIRST_INDEX,
} from "~/libs/constants/common.constants.js";
import { INITIAL_COUNT } from "~/libs/constants/constants.js";
import { HTTPCode } from "~/libs/enums/enums.js";
import { serializeError } from "~/libs/helpers/helpers.js";
import { notification } from "~/libs/modules/notification/notification.js";
import { type AsyncThunkConfig, type RootState } from "~/libs/types/types.js";
import {
	actions as documentActions,
	type DocumentGetPagesQueryDto,
	type DocumentGetPagesResponseDto,
} from "~/modules/documents/documents.js";
import { DocumentStatus } from "~/modules/documents/libs/enums/enums.js";
import {
	type UndoPageResponseDto,
	type VerifyPageRequestDto,
	type VerifyPageResponseDto,
} from "~/modules/pages/pages.js";
import {
	MAX_LOADED_PAGES,
	PAGE_STEP,
} from "~/pages/verification/libs/constants/verification.constants.js";

import { VerificationQueueMessage } from "../libs/constants/constants.js";
import { PageVerificationAction } from "../libs/enums/enums.js";
import { getDiscardedVerificationsMessage } from "../libs/helpers/helpers.js";
import {
	type VerificationQueueItem,
	type VerificationQueueResult,
} from "../libs/types/types.js";
import { name as sliceName } from "./pages.slice.js";

type LoadPagesParameters = {
	documentId: number;
	isBackground?: boolean;
	query: DocumentGetPagesQueryDto;
};

type ReprocessPageParameters = {
	pageId: number;
};

type UndoPageParameters = {
	pageId: number;
};

type VerifyPageParameters = {
	pageId: number;
	payload: VerifyPageRequestDto;
};

const undoPage = createAsyncThunk<
	UndoPageResponseDto,
	UndoPageParameters,
	AsyncThunkConfig
>(
	`${sliceName}/undo`,
	({ pageId }, { extra }) => {
		const { pageApi } = extra;

		return pageApi.undo(pageId);
	},
	{ serializeError },
);

const verifyPage = createAsyncThunk<
	VerifyPageResponseDto,
	VerifyPageParameters,
	AsyncThunkConfig
>(
	`${sliceName}/verify`,
	({ pageId, payload }, { extra }) => {
		const { pageApi } = extra;

		return pageApi.verify(pageId, payload);
	},
	{ serializeError },
);

const reprocessPage = createAsyncThunk<
	null,
	ReprocessPageParameters,
	AsyncThunkConfig
>(
	`${sliceName}/reprocess`,
	async ({ pageId }, { extra }) => {
		const { pageApi } = extra;
		await pageApi.reprocess(pageId);

		return null;
	},
	{ serializeError },
);

const loadPages = createAsyncThunk<
	DocumentGetPagesResponseDto,
	LoadPagesParameters,
	AsyncThunkConfig
>(
	`${sliceName}/load-pages`,
	({ documentId, query }, { extra }) => {
		const { documentApi } = extra;

		return documentApi.getPages(documentId, query);
	},
	{ serializeError },
);

const discardVerificationQueue = createAction<{ documentId: number }>(
	`${sliceName}/discard-verification-queue`,
);

const handleQueueRejection = ({
	dispatch,
	getState,
	item,
	resultError,
}: {
	dispatch: AsyncThunkConfig["dispatch"];
	getState: () => RootState;
	item: VerificationQueueItem;
	resultError: unknown;
}): VerificationQueueResult => {
	const { documentId } = item;
	const discarded = getState().pages.verificationQueue.filter(
		(queued) => queued.documentId === documentId,
	);

	dispatch(discardVerificationQueue({ documentId }));

	if (
		"status" in (resultError as object) &&
		(resultError as { status?: number }).status === HTTPCode.CONFLICT
	) {
		notification.error(VerificationQueueMessage.CONFLICT);
		void dispatch(
			loadPages({
				documentId,
				query: { from: item.pageNo, limit: MAX_LOADED_PAGES },
			}),
		);
	}

	if (discarded.length > EMPTY_LENGTH) {
		notification.error(getDiscardedVerificationsMessage(discarded));
	}

	return {
		completedDocumentId: null,
		discarded,
		failed: {
			error: resultError as AsyncThunkConfig["serializedErrorType"],
			item,
		},
	};
};

const verifyDocumentIsDone = async ({
	dispatch,
	documentId,
}: {
	dispatch: AsyncThunkConfig["dispatch"];
	documentId: number;
}): Promise<boolean> => {
	try {
		const documentResulted = await dispatch(
			documentActions.loadById(documentId),
		).unwrap();
		return documentResulted.status === DocumentStatus.DONE;
	} catch {
		return false;
	}
};

const processVerificationQueue = createAsyncThunk<
	VerificationQueueResult,
	undefined,
	AsyncThunkConfig
>(
	`${sliceName}/process-verification-queue`,
	async (_, { dispatch, getState }) => {
		const getNextItem = (): undefined | VerificationQueueItem =>
			getState().pages.verificationQueue.at(FIRST_INDEX);

		const reloadPage = ({
			documentId,
			pageNo,
		}: VerificationQueueItem): void => {
			void dispatch(
				loadPages({
					documentId,
					query: { from: pageNo, limit: MAX_LOADED_PAGES },
				}),
			);
		};

		let item = getNextItem();
		let completedDocumentId: null | number = null;

		while (item) {
			const { pageId, payload } = item;

			const documentBeforeVerification = getState().documents.document;
			const wasDocumentAlreadyDone =
				documentBeforeVerification?.status === DocumentStatus.DONE;

			const result = await dispatch(verifyPage({ pageId, payload }));

			const isRejected = verifyPage.rejected.match(result);

			if (isRejected) {
				return handleQueueRejection({
					dispatch,
					getState,
					item,
					resultError: result.error,
				});
			}

			const isDone = await verifyDocumentIsDone({
				dispatch,
				documentId: item.documentId,
			});

			const currentDocument = getState().documents.document;
			const isAtFinalPage =
				currentDocument !== null && item.pageNo >= currentDocument.pageCount;

			const isFullyCompleted = wasDocumentAlreadyDone
				? isAtFinalPage
				: isDone ||
					(currentDocument !== null &&
						currentDocument.progress.pagesReadyToCheck === INITIAL_COUNT &&
						currentDocument.progress.pagesPending === INITIAL_COUNT &&
						currentDocument.progress.pagesInWork === INITIAL_COUNT);

			if (isFullyCompleted) {
				completedDocumentId = item.documentId;
				break;
			}

			if (result.payload.next === null) {
				reloadPage(item);
			}

			const wasManualTranscription = payload.transcriptionId === undefined;

			if (wasManualTranscription) {
				reloadPage(item);
			}

			if (payload.action === PageVerificationAction.CORRECT) {
				void dispatch(
					loadPages({
						documentId: item.documentId,
						isBackground: true,
						query: { from: item.pageNo + PAGE_STEP, limit: MAX_LOADED_PAGES },
					}),
				);
			}

			item = getNextItem();
		}

		return { completedDocumentId, discarded: [], failed: null };
	},
	{
		condition: (_, { getState }) =>
			!getState().pages.isVerificationQueueRunning,
		serializeError,
	},
);

export {
	discardVerificationQueue,
	loadPages,
	processVerificationQueue,
	reprocessPage,
	undoPage,
	verifyPage,
};
