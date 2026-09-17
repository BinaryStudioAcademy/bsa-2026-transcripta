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

type LoadPagesParameters = {
	documentId: number;
	query: DocumentGetPagesQueryDto;
};

type ReprocessPageParameters = {
	pageId: number;
};

type VerifyPageParameters = {
	pageId: number;
	payload: VerifyPageRequestDto;
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

const reprocessPage = createAsyncThunk<
	undefined,
	ReprocessPageParameters,
	AsyncThunkConfig
>(
	`${sliceName}/reprocess`,
	async ({ pageId }, { extra }) => {
		const { pageApi } = extra;

		await pageApi.reprocess(pageId);

		// eslint-disable-next-line unicorn/no-useless-undefined -- createAsyncThunk<undefined, ...> requires an explicit undefined return to satisfy AsyncThunkPayloadCreatorReturnValue
		return undefined;
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

export { loadPages, reprocessPage, verifyPage };
