import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import { DataStatus } from "~/libs/enums/enums.js";
import { type SerializedAppError, type ValueOf } from "~/libs/types/types.js";
import { type DocumentGetPagesItemResponseDto } from "~/modules/documents/documents.js";
import { type VerifyPageRequestDto } from "~/modules/pages/pages.js";
import { PageStatus, PageVerificationAction } from "../libs/enums/enums.js";

type RollbackState = {
	cursorPageNo: number;
	status: DocumentGetPagesItemResponseDto["status"];
};

type State = {
	byId: Record<number, DocumentGetPagesItemResponseDto>;
	cursorPageNo: number;
	dataStatus: ValueOf<typeof DataStatus>;
	lastError: null | SerializedAppError;
	rollback: Record<number, RollbackState | undefined>;
};

const initialState: State = {
	byId: {},
	cursorPageNo: 0,
	dataStatus: DataStatus.IDLE,
	lastError: null,
	rollback: {},
};

const verificationStatusMap = {
	[PageVerificationAction.CONFIRM]: PageStatus.CONFIRMED,
	[PageVerificationAction.CORRECT]: PageStatus.CORRECTED,
	[PageVerificationAction.SKIP]: PageStatus.SKIPPED,
} as const;

const { actions, name, reducer } = createSlice({
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
