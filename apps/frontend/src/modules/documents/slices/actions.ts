import { createAsyncThunk } from "@reduxjs/toolkit";

import { serializeError } from "~/libs/helpers/helpers.js";
import { type AsyncThunkConfig } from "~/libs/types/types.js";
import {
	type DocumentCreateRequestDto,
	type DocumentCreateResponseDto,
	type DocumentGetAllResponseDto,
	type DocumentGetByIdResponseDto,
} from "~/modules/documents/documents.js";

import { name as sliceName } from "./documents.slice.js";

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

export { create, loadAll, loadById };
