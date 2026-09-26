import { createAsyncThunk } from "@reduxjs/toolkit";
import {
	type DocumentGetLexiconResponseDto,
	type LexiconInvalidateResponseDto,
} from "@transcripta/shared";

import { serializeError } from "~/libs/helpers/helpers.js";
import { type AsyncThunkConfig } from "~/libs/types/types.js";

import { name as sliceName } from "./lexicon.slice.js";

type InvalidatePayload = {
	id: number;
	reason: string;
};

const loadByDocumentId = createAsyncThunk<
	DocumentGetLexiconResponseDto,
	number,
	AsyncThunkConfig
>(
	`${sliceName}/load-by-document-id`,
	(documentId, { extra }) => {
		const { documentApi } = extra;

		return documentApi.getLexicon(documentId);
	},
	{ serializeError },
);

const invalidate = createAsyncThunk<
	LexiconInvalidateResponseDto,
	InvalidatePayload,
	AsyncThunkConfig
>(
	`${sliceName}/invalidate`,
	({ id, reason }, { extra }) => {
		const { lexiconApi } = extra;

		return lexiconApi.invalidate(id, { reason });
	},
	{ serializeError },
);

export { invalidate, loadByDocumentId };
