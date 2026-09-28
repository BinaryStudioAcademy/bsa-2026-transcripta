import { type RootState } from "~/libs/types/types.js";

const selectCreateStatus = (state: RootState) => state.presets.createStatus;

const selectPresets = (state: RootState) => state.presets.presets;

const selectPresetsStatus = (state: RootState) => state.presets.presetsStatus;

const selectSelectedPreset = (state: RootState) => state.presets.selectedPreset;

const selectSelectedPresetStatus = (state: RootState) =>
	state.presets.selectedPresetStatus;

export {
	selectCreateStatus,
	selectPresets,
	selectPresetsStatus,
	selectSelectedPreset,
	selectSelectedPresetStatus,
};
