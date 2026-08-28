import { createAsyncThunk } from "@reduxjs/toolkit";

import { type AsyncThunkConfig } from "~/libs/types/types.js";
import { type DocumentGetAllResponseDto } from "~/modules/documents/documents.js";

import { name as sliceName } from "./documents.slice.js";

const loadAll = createAsyncThunk<
	DocumentGetAllResponseDto,
	undefined,
	AsyncThunkConfig
>(`${sliceName}/load-all`, (_, { extra }) => {
	const { documentApi } = extra;

	return documentApi.getAll();
});

export { loadAll };
