import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

import { DataStatus } from "~/libs/enums/enums.js";
import { type ValueOf } from "~/libs/types/types.js";
import { type DocumentGetPagesItemResponseDto } from "~/modules/documents/documents.js";

import { PageStatus, PageVerificationAction } from "../libs/enums/enums.js";
import { type VerificationQueueItem } from "../libs/types/types.js";
import {
	discardVerificationQueue,
	loadPages,
	processVerificationQueue,
	reprocessPage,
	undoPage,
	verifyPage,
} from "./actions.js";

type RollbackState = {
	cursorPageNo: number;
	status: DocumentGetPagesItemResponseDto["status"];
	text: null | string;
};

type State = {
	byId: Record<number, DocumentGetPagesItemResponseDto>;
	cursorPageNo: number;
	dataStatus: ValueOf<typeof DataStatus>;
	idsByPageNo: Record<number, number>;
	isVerificationQueueRunning: boolean;
	lastVerifiedPageId: null | number;
	reprocessingPageId: null | number;
	rollback: Record<number, RollbackState | undefined>;
	verificationDataStatus: ValueOf<typeof DataStatus>;
	verificationQueue: VerificationQueueItem[];
	verifyingPageId: null | number;
};

const initialState: State = {
	byId: {},
	cursorPageNo: 0,
	dataStatus: DataStatus.IDLE,
	idsByPageNo: {},
	isVerificationQueueRunning: false,
	lastVerifiedPageId: null,
	reprocessingPageId: null,
	rollback: {},
	verificationDataStatus: DataStatus.IDLE,
	verificationQueue: [],
	verifyingPageId: null,
};

const verificationStatusMap = {
	[PageVerificationAction.CONFIRM]: PageStatus.CONFIRMED,
	[PageVerificationAction.CORRECT]: PageStatus.CORRECTED,
	[PageVerificationAction.SKIP]: PageStatus.SKIPPED,
} as const;

const { actions, name, reducer } = createSlice({
	extraReducers(builder) {
		builder.addCase(processVerificationQueue.pending, (state) => {
			state.isVerificationQueueRunning = true;
		});

		builder.addCase(processVerificationQueue.fulfilled, (state) => {
			state.isVerificationQueueRunning = false;
		});

		builder.addCase(processVerificationQueue.rejected, (state) => {
			state.isVerificationQueueRunning = false;
		});

		builder.addCase(discardVerificationQueue, (state, action) => {
			state.verificationQueue = state.verificationQueue.filter(
				(item) => item.documentId !== action.payload.documentId,
			);
		});

		// The optimistic step: the action leaves the queue here, synchronously
		// with the request, so only one page per document is ever outstanding
		// and `rollback` holds a single entry.
		builder.addCase(verifyPage.pending, (state, action) => {
			const { pageId, payload } = action.meta.arg;
			const page = state.byId[pageId];

			state.verificationQueue = state.verificationQueue.filter(
				(item) => item.pageId !== pageId,
			);
			state.verificationDataStatus = DataStatus.PENDING;
			state.verifyingPageId = pageId;

			if (!page) {
				return;
			}

			state.rollback[pageId] = {
				cursorPageNo: page.pageNo,
				status: page.status,
				text: page.transcription?.text ?? null,
			};

			if (
				payload.action === PageVerificationAction.CORRECT &&
				page.transcription !== null &&
				payload.text !== undefined
			) {
				page.transcription.text = payload.text;
			}

			page.status = verificationStatusMap[payload.action];
		});

		builder.addCase(verifyPage.fulfilled, (state, { payload }) => {
			state.rollback[payload.pageId] = undefined;
			state.lastVerifiedPageId = payload.pageId;
			state.verificationDataStatus = DataStatus.FULFILLED;
			state.verifyingPageId = null;

			if (!payload.next) {
				return;
			}

			const nextPage = state.byId[payload.next.pageId];

			// The cursor is not touched here: it already moved on the keypress,
			// and during a burst it is several pages ahead of this response.
			if (!nextPage) {
				return;
			}

			nextPage.status = payload.next.status;

			if (nextPage.transcription && payload.next.transcription) {
				nextPage.transcription.contextWords =
					payload.next.transcription.contextWords;

				nextPage.transcription.text = payload.next.transcription.text;
			}
		});

		builder.addCase(verifyPage.rejected, (state, action) => {
			const { pageId } = action.meta.arg;
			const previous = state.rollback[pageId];

			if (previous && state.byId[pageId]) {
				const page = state.byId[pageId];

				page.status = previous.status;

				if (page.transcription && previous.text !== null) {
					page.transcription.text = previous.text;
				}

				state.cursorPageNo = previous.cursorPageNo;
				state.rollback[pageId] = undefined;
			}

			state.verificationDataStatus = DataStatus.REJECTED;
			state.verifyingPageId = null;
		});

		builder.addCase(undoPage.pending, (state) => {
			state.verificationDataStatus = DataStatus.PENDING;
		});

		builder.addCase(undoPage.fulfilled, (state, { payload }) => {
			const page = state.byId[payload.pageId];

			if (page) {
				page.status = payload.status;
				page.transcription = payload.transcription;
				state.cursorPageNo = page.pageNo;
			}

			state.rollback[payload.pageId] = undefined;
			state.lastVerifiedPageId = null;
			state.verificationDataStatus = DataStatus.FULFILLED;
		});

		builder.addCase(undoPage.rejected, (state, action) => {
			const { pageId } = action.meta.arg;
			const previous = state.rollback[pageId];

			if (previous && state.byId[pageId]) {
				state.byId[pageId].status = previous.status;
				state.cursorPageNo = previous.cursorPageNo;
				state.rollback[pageId] = undefined;
			}

			state.verificationDataStatus = DataStatus.REJECTED;
		});

		builder.addCase(reprocessPage.pending, (state, action) => {
			state.reprocessingPageId = action.meta.arg.pageId;
		});

		builder.addCase(reprocessPage.fulfilled, (state, action) => {
			const { pageId } = action.meta.arg;
			const page = state.byId[pageId];

			if (page) {
				page.status = PageStatus.QUEUED;
				page.attempts = 0;
				page.lastError = null;
			}

			if (state.reprocessingPageId === pageId) {
				state.reprocessingPageId = null;
			}
		});

		builder.addCase(reprocessPage.rejected, (state, action) => {
			const { pageId } = action.meta.arg;

			if (state.reprocessingPageId === pageId) {
				state.reprocessingPageId = null;
			}
		});

		builder.addCase(loadPages.pending, (state) => {
			state.dataStatus = DataStatus.PENDING;
		});

		builder.addCase(loadPages.fulfilled, (state, action) => {
			for (const page of action.payload.items) {
				// A page with a request in flight keeps its optimistic state
				// until that request settles.
				if (state.rollback[page.id]) {
					continue;
				}

				state.byId[page.id] = page;
				state.idsByPageNo[page.pageNo] = page.id;
			}
			state.dataStatus = DataStatus.FULFILLED;
		});

		builder.addCase(loadPages.rejected, (state) => {
			state.dataStatus = DataStatus.REJECTED;
		});
	},
	initialState,
	name: "pages",
	reducers: {
		// The keypress: the cursor moves now, the page status changes only when
		// the action leaves the queue (see `verifyPage.pending`).
		enqueueVerification: (
			state,
			action: PayloadAction<{
				item: VerificationQueueItem;
				pageCount: number;
			}>,
		) => {
			const { item, pageCount } = action.payload;

			const isAlreadyQueued =
				state.verifyingPageId === item.pageId ||
				state.verificationQueue.some((queued) => queued.pageId === item.pageId);

			if (isAlreadyQueued) {
				return;
			}

			state.verificationQueue.push(item);

			if (state.cursorPageNo < pageCount) {
				state.cursorPageNo += 1;
			}
		},

		reset: (state) => {
			state.byId = {};
			state.idsByPageNo = {};
			state.cursorPageNo = 0;
			state.dataStatus = DataStatus.IDLE;
			state.lastVerifiedPageId = null;
			state.reprocessingPageId = null;
			state.rollback = {};
			state.verificationDataStatus = DataStatus.IDLE;
			state.verificationQueue = [];
			state.verifyingPageId = null;
		},

		setCursorPageNo: (state, action: PayloadAction<number>) => {
			state.cursorPageNo = action.payload;
		},

		undoOptimistic: (
			state,
			action: PayloadAction<{
				pageId: number;
			}>,
		) => {
			const { pageId } = action.payload;
			const page = state.byId[pageId];

			if (!page) {
				return;
			}

			state.rollback[pageId] = {
				cursorPageNo: state.cursorPageNo,
				status: page.status,
				text: page.transcription?.text ?? null,
			};

			page.status = PageStatus.TRANSCRIBED;
			state.cursorPageNo = page.pageNo;
		},
	},
});

export { actions, name, reducer };
