import { createAsyncThunk } from "@reduxjs/toolkit";

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

export { create, getUploadUrl, ingest, loadAll, loadById };
