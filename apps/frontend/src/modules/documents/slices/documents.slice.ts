import { createSlice, isAnyOf } from "@reduxjs/toolkit";

import { DataStatus } from "~/libs/enums/enums.js";
import { type DataStatusValue } from "~/libs/types/types.js";
import {
	type DocumentCreateResponseDto,
	type DocumentGetAllItemResponseDto,
	type DocumentGetByIdResponseDto,
} from "~/modules/documents/documents.js";
import { DocumentStatus } from "~/modules/documents/libs/enums/enums.js";

import { create, loadAll, loadById, pause, remove, resume } from "./actions.js";

type State = {
	createdDocument: DocumentCreateResponseDto | null;
	dataStatus: DataStatusValue;
	document: DocumentGetByIdResponseDto | null;
	documentDataStatus: DataStatusValue;
	documents: DocumentGetAllItemResponseDto[];
	pauseResumeDataStatus: DataStatusValue;
	requestedDocumentId: null | number;
};

const initialState: State = {
	createdDocument: null,
	dataStatus: DataStatus.IDLE,
	document: null,
	documentDataStatus: DataStatus.IDLE,
	documents: [],
	pauseResumeDataStatus: DataStatus.IDLE,
	requestedDocumentId: null,
};

const { actions, name, reducer } = createSlice({
	extraReducers(builder) {
		builder.addCase(create.pending, (state) => {
			state.dataStatus = DataStatus.PENDING;
		});

		builder.addCase(create.fulfilled, (state, action) => {
			state.dataStatus = DataStatus.FULFILLED;
			state.createdDocument = action.payload;
		});

		builder.addCase(create.rejected, (state) => {
			state.dataStatus = DataStatus.REJECTED;
			state.createdDocument = null;
		});

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
		builder.addCase(remove.fulfilled, (state, action) => {
			state.documents = state.documents.filter(
				(document_) => document_.id !== action.payload,
			);

			if (state.document?.id === action.payload) {
				state.document = null;
			}
		});
		builder.addCase(pause.fulfilled, (state, action) => {
			state.pauseResumeDataStatus = DataStatus.FULFILLED;
			if (state.document && state.document.id === action.payload) {
				state.document.status = DocumentStatus.PAUSED;
			}
		});
		builder.addCase(resume.fulfilled, (state, action) => {
			state.pauseResumeDataStatus = DataStatus.FULFILLED;
			if (state.document && state.document.id === action.payload) {
				state.document.status = DocumentStatus.PROCESSING;
			}
		});
		builder.addMatcher(isAnyOf(pause.pending, resume.pending), (state) => {
			state.pauseResumeDataStatus = DataStatus.PENDING;
		});
		builder.addMatcher(isAnyOf(pause.rejected, resume.rejected), (state) => {
			state.pauseResumeDataStatus = DataStatus.REJECTED;
		});
	},
	initialState,
	name: "documents",
	reducers: {},
});

export { actions, name, reducer };
