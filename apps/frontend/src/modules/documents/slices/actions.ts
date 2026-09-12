import { createAction, createAsyncThunk } from "@reduxjs/toolkit";

import { INITIAL_COUNT } from "~/libs/constants/constants.js";
import { serializeError } from "~/libs/helpers/helpers.js";
import { type AsyncThunkConfig } from "~/libs/types/types.js";
import {
	type DocumentCreateRequestDto,
	type DocumentCreateResponseDto,
	type DocumentGetAllResponseDto,
	type DocumentGetByIdResponseDto,
	type DocumentUploadUrlRequestDto,
	type DocumentUploadUrlResponseDto,
} from "~/modules/documents/documents.js";

import {
	POLLING_INTERVAL_MS,
	TERMINAL_DOCUMENT_STATUSES,
} from "../libs/constants/constants.js";
import { name as sliceName } from "./documents.slice.js";

type GetUploadUrlPayload = {
	id: number;
	payload?: DocumentUploadUrlRequestDto;
	signal?: AbortSignal;
};

const create = createAsyncThunk<
	DocumentCreateResponseDto,
	DocumentCreateRequestDto,
	AsyncThunkConfig
>(
	`${sliceName}/create`,
	(payload, { extra }) => {
		const { documentApi } = extra;

		return documentApi.create(payload);
	},
	{ serializeError },
);

const getUploadUrl = createAsyncThunk<
	DocumentUploadUrlResponseDto,
	GetUploadUrlPayload,
	AsyncThunkConfig
>(
	`${sliceName}/get-upload-url`,
	({ id, payload, signal }, { extra }) => {
		const { documentApi } = extra;
		return documentApi.getUploadUrl(id, payload, signal);
	},
	{ serializeError },
);

const ingest = createAsyncThunk<number, number, AsyncThunkConfig>(
	`${sliceName}/ingest`,
	async (id, { extra }) => {
		const { documentApi } = extra;

		await documentApi.ingest(id);
		return id;
	},
	{ serializeError },
);

const loadAll = createAsyncThunk<
	DocumentGetAllResponseDto,
	undefined,
	AsyncThunkConfig
>(
	`${sliceName}/load-all`,
	(_, { extra }) => {
		const { documentApi } = extra;

		return documentApi.getAll();
	},
	{ serializeError },
);

const loadById = createAsyncThunk<
	DocumentGetByIdResponseDto,
	number,
	AsyncThunkConfig
>(
	`${sliceName}/load-by-id`,
	(id, { extra }) => {
		const { documentApi } = extra;

		return documentApi.getById(id);
	},
	{ serializeError },
);

const pollDocumentById = createAsyncThunk<
	DocumentGetByIdResponseDto,
	number,
	AsyncThunkConfig
>(
	`${sliceName}/poll-by-id`,
	(id, { extra }) => {
		const { documentApi } = extra;
		return documentApi.getById(id);
	},
	{ serializeError },
);

const remove = createAsyncThunk<number, number, AsyncThunkConfig>(
	`${sliceName}/remove`,
	async (id, { extra }) => {
		const { documentApi } = extra;
		await documentApi.remove(id);
		return id;
	},
	{ serializeError },
);

let pollingIntervalId: null | ReturnType<typeof setInterval>;
let consecutiveErrors = 0;
const MAX_ALLOWED_ERRORS = 1;

const stopPolling = createAction(`${sliceName}/stop-polling`, () => {
	if (pollingIntervalId !== null) {
		clearInterval(pollingIntervalId);
		pollingIntervalId = null;
	}
	return { payload: undefined };
});

const startPolling = createAsyncThunk<unknown, number, AsyncThunkConfig>(
	`${sliceName}/start-polling`,
	(documentId, { dispatch, getState }) => {
		if (pollingIntervalId !== null) {
			clearInterval(pollingIntervalId);
			pollingIntervalId = null;
		}

		let isrequestInFlight = false;

		const executePoll = (): void => {
			if (isrequestInFlight) {
				return;
			}

			const state = getState();
			const currentDocument = state.documents.document;

			if (!currentDocument) {
				return;
			}

			if (TERMINAL_DOCUMENT_STATUSES.has(currentDocument.status)) {
				dispatch(stopPolling());
				return;
			}

			isrequestInFlight = true;

			dispatch(pollDocumentById(documentId))
				.unwrap()
				.then(() => {
					consecutiveErrors = INITIAL_COUNT;
					isrequestInFlight = false;
				})
				.catch(() => {
					consecutiveErrors++;
					isrequestInFlight = false;

					if (consecutiveErrors >= MAX_ALLOWED_ERRORS) {
						dispatch(stopPolling());
					}
				});
		};

		executePoll();

		pollingIntervalId = setInterval(() => {
			executePoll();
		}, POLLING_INTERVAL_MS);
	},
);

export {
	create,
	getUploadUrl,
	ingest,
	loadAll,
	loadById,
	pollDocumentById,
	remove,
	startPolling,
	stopPolling,
};
