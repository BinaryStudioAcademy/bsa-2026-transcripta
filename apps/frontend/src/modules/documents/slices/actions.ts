import { createAsyncThunk } from "@reduxjs/toolkit";

import { serializeError } from "~/libs/helpers/helpers.js";
import { type AsyncThunkConfig } from "~/libs/types/types.js";
import { type DocumentGetAllResponseDto } from "~/modules/documents/documents.js";

import { name as sliceName } from "./documents.slice.js";

const DEFAULT_PRESET_ID = 1;
const PDF_EXTENSION_PATTERN = /\.pdf$/i;
const EMPTY_STRING = "";

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

const upload = createAsyncThunk<
	DocumentGetAllResponseDto,
	File,
	AsyncThunkConfig
>(
	`${sliceName}/upload`,
	async (file, { dispatch, extra }) => {
		const { documentApi } = extra;
		const createdDocument = await documentApi.create({
			fileBytes: file.size,
			fileName: file.name,
			presetId: DEFAULT_PRESET_ID,
			title: file.name.replace(PDF_EXTENSION_PATTERN, EMPTY_STRING),
		});

		await documentApi.uploadFile(createdDocument.uploadUrl, file);
		await documentApi.ingest(createdDocument.id);

		return await dispatch(loadAll()).unwrap();
	},
	{ serializeError },
);

export { loadAll, upload };
