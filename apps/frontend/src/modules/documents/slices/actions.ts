import { createAsyncThunk } from "@reduxjs/toolkit";

import { type AsyncThunkConfig } from "~/libs/types/types.js";
import {
	type DocumentGetAllResponseDto,
	type DocumentGetByIdResponseDto,
} from "~/modules/documents/documents.js";

import { name as sliceName } from "./documents.slice.js";

const loadAll = createAsyncThunk<
	DocumentGetAllResponseDto,
	undefined,
	AsyncThunkConfig
>(`${sliceName}/load-all`, (_, { extra }) => {
	const { documentApi } = extra;

	return documentApi.getAll();
});

const loadById = createAsyncThunk<
	DocumentGetByIdResponseDto,
	number,
	AsyncThunkConfig
>(`${sliceName}/load-by-id`, (id, { extra }) => {
	const { documentApi } = extra;

	return documentApi.getById(id);
});
export { loadAll, loadById };
