import { createSlice } from "@reduxjs/toolkit";
import { type PresetGetAllItemResponseDto } from "@transcripta/shared";

import { DataStatus } from "~/libs/enums/enums.js";
import { type DataStatusValue } from "~/libs/types/types.js";

import { loadAll } from "./actions.js";

type State = {
	dataStatus: DataStatusValue;
	presets: PresetGetAllItemResponseDto[];
};

const initialState: State = {
	dataStatus: DataStatus.IDLE,
	presets: [],
};

const { actions, name, reducer } = createSlice({
	extraReducers(builder) {
		builder.addCase(loadAll.pending, (state) => {
			state.dataStatus = DataStatus.PENDING;
		});

		builder.addCase(loadAll.fulfilled, (state, action) => {
			state.presets = action.payload.items;
			state.dataStatus = DataStatus.FULFILLED;
		});

		builder.addCase(loadAll.rejected, (state) => {
			state.dataStatus = DataStatus.REJECTED;
		});
	},
	initialState,
	name: "presets",
	reducers: {},
});

export { actions, name, reducer };
