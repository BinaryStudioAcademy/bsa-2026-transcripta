import {
	type GlossaryEntry,
	type PresetFormState,
} from "../types/preset-editor.types.js";

const areStringsEqual = (first: string, second: string): boolean =>
	first.trim() === second.trim();

const areGlossaryEntriesEqual = (
	first: GlossaryEntry[],
	second: GlossaryEntry[],
): boolean =>
	first.length === second.length &&
	first.every((entry, index) => {
		const other = second[index];

		return (
			other !== undefined &&
			entry.kind === other.kind &&
			areStringsEqual(entry.note ?? "", other.note ?? "") &&
			areStringsEqual(entry.value, other.value)
		);
	});

const isPresetFormDirty = (
	initialState: null | PresetFormState,
	currentState: PresetFormState,
): boolean => {
	if (!initialState) {
		return false;
	}

	return (
		initialState.basePresetId !== currentState.basePresetId ||
		!areStringsEqual(initialState.name, currentState.name) ||
		!areStringsEqual(initialState.description, currentState.description) ||
		!areStringsEqual(initialState.instructions, currentState.instructions) ||
		!areGlossaryEntriesEqual(initialState.entries, currentState.entries)
	);
};

export { isPresetFormDirty };
