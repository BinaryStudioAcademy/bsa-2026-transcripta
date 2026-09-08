import { createAsyncThunk } from "@reduxjs/toolkit";

import { serializeError } from "~/libs/helpers/helpers.js";
import { type AsyncThunkConfig } from "~/libs/types/types.js";
import {
	type DocumentGetPagesQueryDto,
	type DocumentGetPagesResponseDto,
} from "~/modules/documents/documents.js";
import {
	type VerifyPageRequestDto,
	type VerifyPageResponseDto,
} from "~/modules/pages/pages.js";

import { name as sliceName } from "./pages.slice.js";

type VerifyPageParameters = {
	pageId: number;
	payload: VerifyPageRequestDto;
};

type LoadPagesParameters = {
	documentId: number;
	query: DocumentGetPagesQueryDto;
};

const verifyPage = createAsyncThunk<
	VerifyPageResponseDto,
	VerifyPageParameters,
	AsyncThunkConfig
>(
	`${sliceName}/verify`,
	({ pageId, payload }, { extra }) => {
		const { pageApi } = extra;

		return pageApi.verify(pageId, payload);
	},
	{ serializeError },
);

const loadPages = createAsyncThunk<
	DocumentGetPagesResponseDto,
	LoadPagesParameters,
	AsyncThunkConfig
>(
	`${sliceName}/load-pages`,
	({ documentId, query }, { extra }) => {
		const { documentApi } = extra;

		return documentApi.getPages(documentId, query);
	},
	{ serializeError },
);

export { loadPages, verifyPage };
