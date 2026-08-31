import { createAsyncThunk } from "@reduxjs/toolkit";

import { serializeError } from "~/libs/helpers/helpers.js";
import { type AsyncThunkConfig } from "~/libs/types/types.js";
import { type DocumentGetAllResponseDto } from "~/modules/documents/documents.js";

import { name as sliceName } from "./documents.slice.js";

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

export { loadAll };
