import { createSlice } from "@reduxjs/toolkit";

import { DataStatus } from "~/libs/enums/enums.js";
import { type SerializedAppError, type ValueOf } from "~/libs/types/types.js";
import { type DocumentGetPagesItemResponseDto } from "~/modules/documents/documents.js";

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

const { actions, name, reducer } = createSlice({
	initialState,
	name: "pages",
	reducers: {},
});

export { actions, name, reducer };
