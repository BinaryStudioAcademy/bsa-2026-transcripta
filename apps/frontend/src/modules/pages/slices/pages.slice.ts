import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

import { DataStatus } from "~/libs/enums/enums.js";
import { type SerializedAppError, type ValueOf } from "~/libs/types/types.js";
import { type DocumentGetPagesItemResponseDto } from "~/modules/documents/documents.js";
import { type VerifyPageRequestDto } from "~/modules/pages/pages.js";

import { PageStatus, PageVerificationAction } from "../libs/enums/enums.js";
import { loadPages, verifyPage } from "./actions.js";

type RollbackState = {
	cursorPageNo: number;
	status: DocumentGetPagesItemResponseDto["status"];
};

type State = {
	byId: Record<number, DocumentGetPagesItemResponseDto>;
	cursorPageNo: number;
	dataStatus: ValueOf<typeof DataStatus>;
	idsByPageNo: Record<number, number>;
	lastError: null | SerializedAppError;
	rollback: Record<number, RollbackState | undefined>;
};

const initialState: State = {
	byId: {},
	cursorPageNo: 0,
	dataStatus: DataStatus.IDLE,
	idsByPageNo: {},
	lastError: null,
	rollback: {},
};

const verificationStatusMap = {
	[PageVerificationAction.CONFIRM]: PageStatus.CONFIRMED,
	[PageVerificationAction.CORRECT]: PageStatus.CORRECTED,
	[PageVerificationAction.SKIP]: PageStatus.SKIPPED,
} as const;

const { actions, name, reducer } = createSlice({
	extraReducers(builder) {
		builder.addCase(verifyPage.fulfilled, (state, { payload }) => {
			state.rollback[payload.pageId] = undefined;

			if (payload.next) {
				const nextPage = state.byId[payload.next.pageId];
				if (nextPage) {
					nextPage.status = payload.next.status;
					if (nextPage.transcription && payload.next.transcription) {
						nextPage.transcription.contextWords =
							payload.next.transcription.contextWords;
						nextPage.transcription.text = payload.next.transcription.text;
					}
				}
			}
		});

		builder.addCase(verifyPage.rejected, (state, action) => {
			const { pageId } = action.meta.arg;
			const previous = state.rollback[pageId];

			if (!previous) {
				state.dataStatus = DataStatus.REJECTED;
				state.lastError = action.error;
				return;
			}

			if (state.byId[pageId]) {
				state.byId[pageId].status = previous.status;
				state.cursorPageNo = previous.cursorPageNo;
				state.rollback[pageId] = undefined;
			}

			state.dataStatus = DataStatus.REJECTED;
			state.lastError = action.error;
		});

		builder.addCase(loadPages.pending, (state) => {
			state.dataStatus = DataStatus.PENDING;
			state.lastError = null;
		});

		builder.addCase(loadPages.fulfilled, (state, action) => {
			for (const page of action.payload.items) {
				state.byId[page.id] = page;
				state.idsByPageNo[page.pageNo] = page.id;
			}
			state.cursorPageNo = action.meta.arg.query.from;
			state.dataStatus = DataStatus.FULFILLED;
		});

		builder.addCase(loadPages.rejected, (state, action) => {
			state.dataStatus = DataStatus.REJECTED;
			state.lastError = action.error;
		});
	},
	initialState,
	name: "pages",
	reducers: {
		verifyOptimistic: (
			state,
			action: PayloadAction<{
				pageId: number;
				payload: VerifyPageRequestDto;
			}>,
		) => {
			const { pageId, payload } = action.payload;
			const page = state.byId[pageId];

			if (!page) {
				return;
			}

			state.rollback[pageId] = {
				cursorPageNo: state.cursorPageNo,
				status: page.status,
			};

			page.status = verificationStatusMap[payload.action];
			state.cursorPageNo += 1;
		},
	},
});

export { actions, name, reducer };
