import { createAction, createAsyncThunk } from "@reduxjs/toolkit";

import {
	EMPTY_LENGTH,
	FIRST_INDEX,
} from "~/libs/constants/common.constants.js";
import { HTTPCode } from "~/libs/enums/enums.js";
import { serializeError } from "~/libs/helpers/helpers.js";
import { notification } from "~/libs/modules/notification/notification.js";
import { type AsyncThunkConfig } from "~/libs/types/types.js";
import {
	type DocumentGetPagesQueryDto,
	type DocumentGetPagesResponseDto,
} from "~/modules/documents/documents.js";
import {
	type UndoPageResponseDto,
	type VerifyPageRequestDto,
	type VerifyPageResponseDto,
} from "~/modules/pages/pages.js";
import { MAX_LOADED_PAGES } from "~/pages/verification/libs/constants/verification.constants.js";

import { VerificationQueueMessage } from "../libs/constants/constants.js";
import { getDiscardedVerificationsMessage } from "../libs/helpers/helpers.js";
import {
	type VerificationQueueItem,
	type VerificationQueueResult,
} from "../libs/types/types.js";
import { name as sliceName } from "./pages.slice.js";

type LoadPagesParameters = {
	documentId: number;
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

// Sends queued verifications one at a time: the next action leaves the queue
// only after the previous response. `condition` keeps a single runner alive,
// so every keypress can dispatch this and only the first one starts it.
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

		while (item) {
			const { pageId, payload } = item;
			const result = await dispatch(verifyPage({ pageId, payload }));

			const isRejected = verifyPage.rejected.match(result);

			if (isRejected) {
				const { documentId } = item;
				const discarded = getState().pages.verificationQueue.filter(
					(queued) => queued.documentId === documentId,
				);

				dispatch(discardVerificationQueue({ documentId }));

				if (
					"status" in result.error &&
					result.error.status === HTTPCode.CONFLICT
				) {
					notification.error(VerificationQueueMessage.CONFLICT);
					reloadPage(item);
				}

				if (discarded.length > EMPTY_LENGTH) {
					notification.error(getDiscardedVerificationsMessage(discarded));
				}

				return { discarded, failed: { error: result.error, item } };
			}

			const wasManualTranscription = payload.transcriptionId === undefined;

			if (wasManualTranscription) {
				reloadPage(item);
			}

			item = getNextItem();
		}

		return { discarded: [], failed: null };
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
