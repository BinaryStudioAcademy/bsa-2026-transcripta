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
	requestedDocumentId: null | number;
};

const initialState: State = {
	dataStatus: DataStatus.IDLE,
	document: null,
	documentDataStatus: DataStatus.IDLE,
	documents: [],
	requestedDocumentId: null,
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
		builder.addCase(loadById.pending, (state, action) => {
			state.document = null;
			state.documentDataStatus = DataStatus.PENDING;
			state.requestedDocumentId = action.meta.arg;
		});
		builder.addCase(loadById.fulfilled, (state, action) => {
			if (action.meta.arg !== state.requestedDocumentId) {
				return;
			}

			state.document = action.payload;
			state.documentDataStatus = DataStatus.FULFILLED;
		});
		builder.addCase(loadById.rejected, (state, action) => {
			if (action.meta.arg !== state.requestedDocumentId) {
				return;
			}

			state.document = null;
			state.documentDataStatus = DataStatus.REJECTED;
		});
	},
	initialState,
	name: "documents",
	reducers: {},
});

export { actions, name, reducer };
