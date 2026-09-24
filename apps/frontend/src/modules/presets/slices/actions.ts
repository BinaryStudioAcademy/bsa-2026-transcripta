import { createAsyncThunk } from "@reduxjs/toolkit";

import { serializeError } from "~/libs/helpers/helpers.js";
import { type AsyncThunkConfig } from "~/libs/types/types.js";

import {
	type PresetGetAllResponseDto,
	type PresetGetByIdResponseDto,
} from "../libs/types/types.js";
import { name as sliceName } from "./presets.slice.js";

const loadAll = createAsyncThunk<
	PresetGetAllResponseDto,
	undefined,
	AsyncThunkConfig
>(
	`${sliceName}/load-all`,
	(_, { extra }) => {
		const { presetApi } = extra;

		return presetApi.getAll();
	},
	{ serializeError },
);

const loadById = createAsyncThunk<
	PresetGetByIdResponseDto,
	number,
	AsyncThunkConfig
>(
	`${sliceName}/load-by-id`,
	(id, { extra }) => {
		const { presetApi } = extra;

		return presetApi.getById(id);
	},
	{ serializeError },
);

export { loadAll, loadById };
