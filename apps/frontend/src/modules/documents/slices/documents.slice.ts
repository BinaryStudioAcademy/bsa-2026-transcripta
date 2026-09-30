import { type ActionReducerMapBuilder, createSlice } from "@reduxjs/toolkit";
import { getDocumentExportFileName } from "@transcripta/shared";

import { INGESTION_FAILED_MESSAGE } from "~/libs/constants/constants.js";
import { DataStatus } from "~/libs/enums/enums.js";
import { type DataStatusValue } from "~/libs/types/types.js";
import {
	type DocumentCreateResponseDto,
	type DocumentExport,
	type DocumentGetAllItemResponseDto,
	type DocumentGetByIdResponseDto,
} from "~/modules/documents/documents.js";
import {
	DocumentExportStatus,
	DocumentStatus,
	ExportStatusLabel,
} from "~/modules/documents/libs/enums/enums.js";

import { getDocumentExport, getExportMeta } from "../libs/helpers/helpers.js";
import {
	create,
	ingest,
	loadAll,
	loadById,
	pause,
	pollDocumentById,
	remove,
	requestExport,
	resume,
	updateBudget,
	watchExport,
} from "./actions.js";

type State = {
	createdDocument: DocumentCreateResponseDto | null;
	dataStatus: DataStatusValue;
	document: DocumentGetByIdResponseDto | null;
	documentDataStatus: DataStatusValue;
	documentExports: Record<number, DocumentExport[]>;
	documents: DocumentGetAllItemResponseDto[];
	ingestDataStatus: DataStatusValue;
	ingestError: null | string;
	pauseResumeDataStatuses: Record<number, DataStatusValue>;
	requestedDocumentId: null | number;
};

const initialState: State = {
	createdDocument: null,
	dataStatus: DataStatus.IDLE,
	document: null,
	documentDataStatus: DataStatus.IDLE,
	documentExports: {},
	documents: [],
	ingestDataStatus: DataStatus.IDLE,
	ingestError: null,
	pauseResumeDataStatuses: {},
	requestedDocumentId: null,
};

type ExtraReducersBuilder = ActionReducerMapBuilder<State>;

const registerDocumentStateReducers = (builder: ExtraReducersBuilder): void => {
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
		state.documentExports[action.payload.id] = action.payload.exports.map(
			(documentExport) =>
				getDocumentExport(documentExport, action.payload.title),
		);
	});
	builder.addCase(loadById.rejected, (state, action) => {
		if (action.meta.arg !== state.requestedDocumentId) {
			return;
		}

		state.document = null;
		state.documentDataStatus = DataStatus.REJECTED;
	});
	builder.addCase(pollDocumentById.fulfilled, (state, action) => {
		if (state.document && state.document.id === action.payload.id) {
			const isProcessingOrPaused =
				action.payload.status === DocumentStatus.PROCESSING ||
				action.payload.status === DocumentStatus.PAUSED;

			if (
				state.document.status === DocumentStatus.PAUSED &&
				isProcessingOrPaused
			) {
				return;
			}

			state.document = { ...action.payload };
		}
	});
	builder.addCase(remove.fulfilled, (state, action) => {
		state.documents = state.documents.filter(
			(document_) => document_.id !== action.payload,
		);

		if (state.document?.id === action.payload) {
			state.document = null;
		}
	});
};

const registerPauseResumeReducers = (builder: ExtraReducersBuilder): void => {
	builder.addCase(pause.fulfilled, (state, action) => {
		state.pauseResumeDataStatuses[action.meta.arg] = DataStatus.FULFILLED;
	});
	builder.addCase(resume.fulfilled, (state, action) => {
		state.pauseResumeDataStatuses[action.meta.arg] = DataStatus.FULFILLED;

		if (state.document && state.document.id === action.meta.arg) {
			state.document = action.payload;
		}
	});
	builder.addCase(pause.pending, (state, action) => {
		state.pauseResumeDataStatuses[action.meta.arg] = DataStatus.PENDING;

		if (state.document && state.document.id === action.meta.arg) {
			state.document.status = DocumentStatus.PAUSED;
		}
	});
	builder.addCase(resume.pending, (state, action) => {
		state.pauseResumeDataStatuses[action.meta.arg] = DataStatus.PENDING;

		if (state.document && state.document.id === action.meta.arg) {
			state.document.status = DocumentStatus.PROCESSING;
		}
	});
	builder.addCase(pause.rejected, (state, action) => {
		state.pauseResumeDataStatuses[action.meta.arg] = DataStatus.REJECTED;

		if (
			state.document &&
			state.document.id === action.meta.arg &&
			state.document.status === DocumentStatus.PAUSED
		) {
			state.document.status = DocumentStatus.PROCESSING;
		}
	});
	builder.addCase(resume.rejected, (state, action) => {
		state.pauseResumeDataStatuses[action.meta.arg] = DataStatus.REJECTED;

		if (state.document && state.document.id === action.meta.arg) {
			state.document.status = DocumentStatus.PAUSED;
		}
	});
};

const markExportFailed = (documentExport: DocumentExport | undefined): void => {
	if (!documentExport) {
		return;
	}

	documentExport.status = DocumentExportStatus.FAILED;
	documentExport.readyMeta = ExportStatusLabel.FAILED;
};

const registerExportReducers = (builder: ExtraReducersBuilder): void => {
	builder.addCase(requestExport.pending, (state, action) => {
		const { documentId, documentTitle, format } = action.meta.arg;

		state.documentExports[documentId] ??= [];
		state.documentExports[documentId].unshift({
			downloadUrl: null,
			exportId: null,
			id: action.meta.requestId,
			name: getDocumentExportFileName(documentTitle, format),
			readyMeta: ExportStatusLabel.PREPARING,
			status: DocumentExportStatus.QUEUED,
		});
	});
	builder.addCase(requestExport.fulfilled, (state, action) => {
		const documentExport = state.documentExports[
			action.meta.arg.documentId
		]?.find((export_) => export_.id === action.meta.requestId);

		if (documentExport) {
			documentExport.exportId = action.payload.id;
		}
	});
	builder.addCase(requestExport.rejected, (state, action) => {
		markExportFailed(
			state.documentExports[action.meta.arg.documentId]?.find(
				(export_) => export_.id === action.meta.requestId,
			),
		);
	});
	builder.addCase(watchExport.fulfilled, (state, action) => {
		const documentExport = state.documentExports[
			action.meta.arg.documentId
		]?.find((export_) => export_.exportId === action.meta.arg.exportId);

		if (!documentExport) {
			return;
		}

		documentExport.downloadUrl = action.payload.downloadUrl;
		documentExport.readyMeta = getExportMeta(action.payload);
		documentExport.status = action.payload.status;
	});
	builder.addCase(watchExport.rejected, (state, action) => {
		markExportFailed(
			state.documentExports[action.meta.arg.documentId]?.find(
				(export_) => export_.exportId === action.meta.arg.exportId,
			),
		);
	});
};

const registerProcessingReducers = (builder: ExtraReducersBuilder): void => {
	builder.addCase(ingest.pending, (state, action) => {
		state.ingestDataStatus = DataStatus.PENDING;
		state.ingestError = null;
		if (state.document?.id === action.meta.arg) {
			state.document.status = DocumentStatus.INGESTING;
		}
	});

	builder.addCase(ingest.fulfilled, (state, action) => {
		state.ingestDataStatus = DataStatus.FULFILLED;
		state.ingestError = null;
		if (state.document?.id === action.meta.arg) {
			state.document.status = DocumentStatus.READY;
		}
	});

	builder.addCase(ingest.rejected, (state, action) => {
		state.ingestDataStatus = DataStatus.REJECTED;
		state.ingestError = action.error.message ?? INGESTION_FAILED_MESSAGE;
		if (state.document?.id === action.meta.arg) {
			state.document.status = DocumentStatus.FAILED;
		}
	});
	builder.addCase(updateBudget.fulfilled, (state, action) => {
		const { budget, id } = action.payload;
		if (state.document && state.document.id === id) {
			state.document.budget = budget;
			if (
				Number(budget.limitUsd) > Number(budget.spentUsd) &&
				state.document.status === DocumentStatus.BUDGET_STOP
			) {
				state.document.status = DocumentStatus.PROCESSING;
			}
		}
		const documentItem = state.documents.find(
			(document_) => document_.id === id,
		);
		if (documentItem) {
			documentItem.budgetUsd = budget.limitUsd;
			documentItem.spentUsd = budget.spentUsd;
			if (
				Number(budget.limitUsd) > Number(budget.spentUsd) &&
				documentItem.status === DocumentStatus.BUDGET_STOP
			) {
				documentItem.status = DocumentStatus.PROCESSING;
			}
		}
	});
};

const { actions, name, reducer } = createSlice({
	extraReducers(builder) {
		registerDocumentStateReducers(builder);
		registerExportReducers(builder);
		registerPauseResumeReducers(builder);
		registerProcessingReducers(builder);
	},
	initialState,
	name: "documents",
	reducers: {},
});

export { actions, name, reducer };
