import { createAction, createAsyncThunk } from "@reduxjs/toolkit";

import {
	INITIAL_COUNT,
	MAX_FAILURES_BEFORE_STOP,
} from "~/libs/constants/constants.js";
import { serializeError } from "~/libs/helpers/helpers.js";
import { HTTPError } from "~/libs/modules/http/http.js";
import { notification } from "~/libs/modules/notification/notification.js";
import { type AsyncThunkConfig } from "~/libs/types/types.js";
import {
	type DocumentExportGetByIdResponseDto,
	DocumentExportStatus,
} from "~/modules/document-exports/document-exports.js";
import {
	type DocumentCreateRequestDto,
	type DocumentCreateResponseDto,
	type DocumentGetAllResponseDto,
	type DocumentGetByIdBudgetResponseDto,
	type DocumentGetByIdResponseDto,
	type DocumentUpdateBudgetDto,
	type DocumentUploadUrlRequestDto,
	type DocumentUploadUrlResponseDto,
	type ExportFormatValue,
} from "~/modules/documents/documents.js";

import {
	EXPORT_FAILED_MESSAGE,
	EXPORT_POLLING_MAX_ATTEMPTS,
	POLLING_FAILED_NOTIFICATION,
	TERMINAL_DOCUMENT_STATUSES,
} from "../libs/constants/constants.js";
import { PollingIntervalsMS } from "../libs/enums/enums.js";
import { formatFileSize } from "../libs/helpers/helpers.js";
import { name as sliceName } from "./documents.slice.js";

type GetUploadUrlPayload = {
	id: number;
	payload?: DocumentUploadUrlRequestDto;
	signal?: AbortSignal;
};

type RequestExportPayload = {
	documentId: number;
	format: ExportFormatValue;
};

type RequestExportResult = {
	downloadUrl: string;
	name: string;
	readyMeta: string;
};

type UpdateBudgetPayload = {
	id: number;
	payload: DocumentUpdateBudgetDto;
};

let pollingIntervalId: null | ReturnType<typeof setInterval> = null;
let consecutiveErrors = INITIAL_COUNT;

const clearActiveInterval = (): void => {
	if (pollingIntervalId !== null) {
		clearInterval(pollingIntervalId);
		pollingIntervalId = null;
	}
};

const wait = (ms: number): Promise<void> =>
	new Promise((resolve) => {
		setTimeout(resolve, ms);
	});

const waitForExportToFinish = async (
	getExport: () => Promise<DocumentExportGetByIdResponseDto>,
): Promise<DocumentExportGetByIdResponseDto> => {
	let consecutiveFailures = INITIAL_COUNT;

	for (
		let attempt = INITIAL_COUNT;
		attempt < EXPORT_POLLING_MAX_ATTEMPTS;
		attempt++
	) {
		await wait(PollingIntervalsMS.DEFAULT);

		try {
			const documentExport = await getExport();

			if (documentExport.status !== DocumentExportStatus.QUEUED) {
				return documentExport;
			}

			consecutiveFailures = INITIAL_COUNT;
		} catch (error) {
			consecutiveFailures++;

			if (consecutiveFailures >= MAX_FAILURES_BEFORE_STOP) {
				throw error;
			}
		}
	}

	throw new Error(EXPORT_FAILED_MESSAGE);
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

const pause = createAsyncThunk<number, number, AsyncThunkConfig>(
	`${sliceName}/pause`,
	async (id, { extra }) => {
		const { documentApi } = extra;

		await documentApi.pause(id);

		return id;
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

const resume = createAsyncThunk<
	DocumentGetByIdResponseDto,
	number,
	AsyncThunkConfig
>(
	`${sliceName}/resume`,
	async (id, { extra }) => {
		const { documentApi } = extra;

		const document = await documentApi.resume(id);

		return document;
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
		let currentIntervalMs: number = PollingIntervalsMS.DEFAULT;

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
					if (consecutiveErrors > INITIAL_COUNT) {
						consecutiveErrors = INITIAL_COUNT;
						if (currentIntervalMs !== PollingIntervalsMS.DEFAULT) {
							currentIntervalMs = PollingIntervalsMS.DEFAULT;
							clearActiveInterval();
							pollingIntervalId = setInterval(executePoll, currentIntervalMs);
						}
					}
					isRequestInFlight = false;
				})
				.catch(() => {
					if (consecutiveErrors === INITIAL_COUNT) {
						notification.error(POLLING_FAILED_NOTIFICATION);
					}

					consecutiveErrors++;
					isRequestInFlight = false;

					if (
						consecutiveErrors >= MAX_FAILURES_BEFORE_STOP &&
						currentIntervalMs === PollingIntervalsMS.DEFAULT
					) {
						currentIntervalMs = PollingIntervalsMS.FAILED;
						clearActiveInterval();
						pollingIntervalId = setInterval(executePoll, currentIntervalMs);
					}
				});
		};

		executePoll();

		pollingIntervalId = setInterval(() => {
			executePoll();
		}, currentIntervalMs);
	},
);

const updateBudget = createAsyncThunk<
	{ budget: DocumentGetByIdBudgetResponseDto; id: number },
	UpdateBudgetPayload,
	AsyncThunkConfig
>(
	`${sliceName}/update-budget`,
	async ({ id, payload }, { extra }) => {
		const { documentApi } = extra;
		const budget = await documentApi.updateBudget(id, payload);
		return { budget, id };
	},
	{ serializeError },
);

const requestExport = createAsyncThunk<
	RequestExportResult,
	RequestExportPayload,
	AsyncThunkConfig
>(
	`${sliceName}/request-export`,
	async ({ documentId, format }, { extra }) => {
		const { documentApi, documentExportApi } = extra;

		try {
			const { id } = await documentApi.createExport(documentId, { format });
			const documentExport = await waitForExportToFinish(() =>
				documentExportApi.getById(id),
			);

			if (
				documentExport.status !== DocumentExportStatus.READY ||
				documentExport.downloadUrl === null
			) {
				throw new Error(EXPORT_FAILED_MESSAGE);
			}

			return {
				downloadUrl: documentExport.downloadUrl,
				name: `export.${format}`,
				readyMeta: formatFileSize(documentExport.sizeBytes ?? INITIAL_COUNT),
			};
		} catch (error) {
			notification.error(
				error instanceof HTTPError ? error.message : EXPORT_FAILED_MESSAGE,
			);

			throw error;
		}
	},
	{ serializeError },
);

export {
	create,
	getUploadUrl,
	ingest,
	loadAll,
	loadById,
	pause,
	pollDocumentById,
	remove,
	requestExport,
	resume,
	startPolling,
	stopPolling,
	updateBudget,
};
