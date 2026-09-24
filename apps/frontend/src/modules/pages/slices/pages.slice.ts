import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

import { DataStatus } from "~/libs/enums/enums.js";
import { type ValueOf } from "~/libs/types/types.js";
import { type DocumentGetPagesItemResponseDto } from "~/modules/documents/documents.js";
import { type VerifyPageRequestDto } from "~/modules/pages/pages.js";

import { PageStatus, PageVerificationAction } from "../libs/enums/enums.js";
import { loadPages, reprocessPage, undoPage, verifyPage } from "./actions.js";

type RollbackState = {
	cursorPageNo: number;
	status: DocumentGetPagesItemResponseDto["status"];
};

type State = {
	byId: Record<number, DocumentGetPagesItemResponseDto>;
	cursorPageNo: number;
	dataStatus: ValueOf<typeof DataStatus>;
	idsByPageNo: Record<number, number>;
	lastVerifiedPageId: null | number;
	reprocessingPageId: null | number;
	rollback: Record<number, RollbackState | undefined>;
	verificationDataStatus: ValueOf<typeof DataStatus>;
};

const initialState: State = {
	byId: {},
	cursorPageNo: 0,
	dataStatus: DataStatus.IDLE,
	idsByPageNo: {},
	lastVerifiedPageId: null,
	reprocessingPageId: null,
	rollback: {},
	verificationDataStatus: DataStatus.IDLE,
};

const verificationStatusMap = {
	[PageVerificationAction.CONFIRM]: PageStatus.CONFIRMED,
	[PageVerificationAction.CORRECT]: PageStatus.CORRECTED,
	[PageVerificationAction.SKIP]: PageStatus.SKIPPED,
} as const;

const { actions, name, reducer } = createSlice({
	extraReducers(builder) {
		builder.addCase(verifyPage.pending, (state) => {
			state.verificationDataStatus = DataStatus.PENDING;
		});

		builder.addCase(verifyPage.fulfilled, (state, { payload }) => {
			state.rollback[payload.pageId] = undefined;
			state.lastVerifiedPageId = payload.pageId;
			state.verificationDataStatus = DataStatus.FULFILLED;

			if (!payload.next) {
				return;
			}

			const nextPage = state.byId[payload.next.pageId];

			if (!nextPage) {
				return;
			}

			state.cursorPageNo = nextPage.pageNo;

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
				state.byId[pageId].status = previous.status;
				state.cursorPageNo = previous.cursorPageNo;
				state.rollback[pageId] = undefined;
			}

			state.verificationDataStatus = DataStatus.REJECTED;
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
		reset: (state) => {
			state.byId = {};
			state.idsByPageNo = {};
			state.cursorPageNo = 0;
			state.dataStatus = DataStatus.IDLE;
			state.lastVerifiedPageId = null;
			state.reprocessingPageId = null;
			state.rollback = {};
			state.verificationDataStatus = DataStatus.IDLE;
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
			};

			page.status = PageStatus.TRANSCRIBED;
			state.cursorPageNo = page.pageNo;
		},

		verifyOptimistic: (
			state,
			action: PayloadAction<{
				pageCount: number;
				pageId: number;
				payload: VerifyPageRequestDto;
			}>,
		) => {
			const { pageCount, pageId, payload } = action.payload;
			const page = state.byId[pageId];

			if (!page) {
				return;
			}

			state.rollback[pageId] = {
				cursorPageNo: state.cursorPageNo,
				status: page.status,
			};

			if (
				payload.action === PageVerificationAction.CORRECT &&
				page.transcription !== null &&
				payload.text !== undefined
			) {
				page.transcription.text = payload.text;
			}

			page.status = verificationStatusMap[payload.action];

			if (state.cursorPageNo < pageCount) {
				state.cursorPageNo += 1;
			}
		},
	},
});

export { actions, name, reducer };
