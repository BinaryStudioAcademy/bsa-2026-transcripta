import { createAction, createAsyncThunk } from "@reduxjs/toolkit";

import {
	INITIAL_COUNT,
	MAX_FAILURES_BEFORE_STOP,
} from "~/libs/constants/constants.js";
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
	POLLING_FAILED_MESSAGE,
	POLLING_INTERVAL_MS,
	TERMINAL_DOCUMENT_STATUSES,
} from "../libs/constants/constants.js";
import { name as sliceName } from "./documents.slice.js";

type GetUploadUrlPayload = {
	id: number;
	payload?: DocumentUploadUrlRequestDto;
	signal?: AbortSignal;
};

let pollingIntervalId: null | ReturnType<typeof setInterval> = null;
let consecutiveErrors = INITIAL_COUNT;

const clearActiveInterval = (): void => {
	if (pollingIntervalId !== null) {
		clearInterval(pollingIntervalId);
		pollingIntervalId = null;
	}
};

const stopPolling = createAction(`${sliceName}/stop-polling`, () => {
	clearActiveInterval();
	return { payload: undefined };
});

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

const startPolling = createAsyncThunk<unknown, number, AsyncThunkConfig>(
	`${sliceName}/start-polling`,
	(documentId, { dispatch, getState }) => {
		clearActiveInterval();
		consecutiveErrors = INITIAL_COUNT;

		let isRequestInFlight = false;

		const executePoll = (): void => {
			if (isRequestInFlight) {
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

			isRequestInFlight = true;

			dispatch(pollDocumentById(documentId))
				.unwrap()
				.then(() => {
					consecutiveErrors = INITIAL_COUNT;
					isRequestInFlight = false;
				})
				.catch((error: unknown) => {
					// eslint-disable-next-line no-console
					console.error(POLLING_FAILED_MESSAGE, error);
					consecutiveErrors++;
					isRequestInFlight = false;

					if (consecutiveErrors >= MAX_FAILURES_BEFORE_STOP) {
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
