import { createSlice } from "@reduxjs/toolkit";
import { type DocumentGetLexiconItemResponseDto } from "@transcripta/shared";

import { DataStatus } from "~/libs/enums/enums.js";
import { type DataStatusValue } from "~/libs/types/types.js";

import { invalidate, loadByDocumentId } from "./actions.js";

type State = {
	documentId: null | number;
	invalidateDataStatus: DataStatusValue;
	items: DocumentGetLexiconItemResponseDto[];
	loadDataStatus: DataStatusValue;
};

const initialState: State = {
	documentId: null,
	invalidateDataStatus: DataStatus.IDLE,
	items: [],
	loadDataStatus: DataStatus.IDLE,
};

const { actions, name, reducer } = createSlice({
	extraReducers(builder) {
		builder.addCase(loadByDocumentId.pending, (state, action) => {
			state.loadDataStatus = DataStatus.PENDING;

			if (state.documentId !== action.meta.arg) {
				state.items = [];
			}

			state.documentId = action.meta.arg;
		});

		builder.addCase(loadByDocumentId.fulfilled, (state, action) => {
			if (action.meta.arg !== state.documentId) {
				return;
			}

			state.items = action.payload.items;
			state.loadDataStatus = DataStatus.FULFILLED;
		});

		builder.addCase(loadByDocumentId.rejected, (state, action) => {
			if (action.meta.arg !== state.documentId) {
				return;
			}

			state.items = [];
			state.loadDataStatus = DataStatus.REJECTED;
		});

		builder.addCase(invalidate.pending, (state) => {
			state.invalidateDataStatus = DataStatus.PENDING;
		});

		builder.addCase(invalidate.fulfilled, (state, action) => {
			state.invalidateDataStatus = DataStatus.FULFILLED;
			state.items = state.items.filter(
				(item) => item.id !== action.payload.invalidatedId,
			);
		});

		builder.addCase(invalidate.rejected, (state) => {
			state.invalidateDataStatus = DataStatus.REJECTED;
		});
	},
	initialState,
	name: "lexicon",
	reducers: {},
});

export { actions, name, reducer };
