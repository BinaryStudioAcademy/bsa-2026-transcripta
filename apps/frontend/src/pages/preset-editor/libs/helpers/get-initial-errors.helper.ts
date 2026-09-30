import { type PresetFormErrors } from "../types/preset-editor.types.js";

const getInitialErrors = (): PresetFormErrors => ({
	description: null,
	glossary: {},
	instructions: null,
	name: null,
});

export { getInitialErrors };
