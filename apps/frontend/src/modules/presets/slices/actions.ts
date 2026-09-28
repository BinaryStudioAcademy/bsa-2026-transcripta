import { createAsyncThunk } from "@reduxjs/toolkit";
import { type PresetGetAllResponseDto } from "@transcripta/shared";

import { serializeError } from "~/libs/helpers/helpers.js";
import { type AsyncThunkConfig } from "~/libs/types/types.js";

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

export { loadAll };
