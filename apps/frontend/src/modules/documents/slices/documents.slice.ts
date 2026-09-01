import { createSlice } from "@reduxjs/toolkit";

import { DataStatus } from "~/libs/enums/enums.js";
import { type ValueOf } from "~/libs/types/types.js";
import {
	type DocumentGetAllItemResponseDto,
	type DocumentGetByIdResponseDto,
} from "~/modules/documents/documents.js";

import { loadAll, loadById } from "./actions.js";

type State = {
	dataStatus: ValueOf<typeof DataStatus>;
	document: DocumentGetByIdResponseDto | null;
	documentDataStatus: ValueOf<typeof DataStatus>;
	documents: DocumentGetAllItemResponseDto[];
};

const initialState: State = {
	dataStatus: DataStatus.IDLE,
	document: null,
	documentDataStatus: DataStatus.IDLE,
	documents: [],
};

const { actions, name, reducer } = createSlice({
	extraReducers(builder) {
		builder.addCase(loadAll.pending, (state) => {
			state.dataStatus = DataStatus.PENDING;
		});
		builder.addCase(loadAll.fulfilled, (state, action) => {
			state.documents = action.payload.items;
			state.dataStatus = DataStatus.FULFILLED;
		});
		builder.addCase(loadAll.rejected, (state) => {
			state.dataStatus = DataStatus.REJECTED;
		});
		builder.addCase(loadById.pending, (state) => {
			state.documentDataStatus = DataStatus.PENDING;
		});
		builder.addCase(loadById.fulfilled, (state, action) => {
			state.document = action.payload;
			state.documentDataStatus = DataStatus.FULFILLED;
		});
		builder.addCase(loadById.rejected, (state) => {
			state.documentDataStatus = DataStatus.REJECTED;
		});
	},
	initialState,
	name: "documents",
	reducers: {},
});

export { actions, name, reducer };
