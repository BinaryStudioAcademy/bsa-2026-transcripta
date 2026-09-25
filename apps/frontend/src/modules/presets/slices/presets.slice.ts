import { createSlice } from "@reduxjs/toolkit";

import { DataStatus } from "~/libs/enums/enums.js";
import { type DataStatusValue } from "~/libs/types/types.js";

import {
	type PresetGetAllItemResponseDto,
	type PresetGetByIdResponseDto,
} from "../libs/types/types.js";
import { loadAll, loadById } from "./actions.js";

type State = {
	dataStatus: DataStatusValue;
	presets: PresetGetAllItemResponseDto[];
	selectedPreset: null | PresetGetByIdResponseDto;
	selectedPresetStatus: DataStatusValue;
};

const initialState: State = {
	dataStatus: DataStatus.IDLE,
	presets: [],
	selectedPreset: null,
	selectedPresetStatus: DataStatus.IDLE,
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

		builder.addCase(loadById.pending, (state) => {
			state.selectedPreset = null;
			state.selectedPresetStatus = DataStatus.PENDING;
		});

		builder.addCase(loadById.fulfilled, (state, action) => {
			state.selectedPreset = action.payload;
			state.selectedPresetStatus = DataStatus.FULFILLED;
		});

		builder.addCase(loadById.rejected, (state) => {
			state.selectedPreset = null;
			state.selectedPresetStatus = DataStatus.REJECTED;
		});
	},
	initialState,
	name: "presets",
	reducers: {},
});

export { actions, name, reducer };
