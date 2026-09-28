import { GLOSSARY_TYPES } from "../constants/preset-editor.constants.js";
import { GlossaryType } from "../types/preset-editor.types.js";

const isGlossaryType = (value: unknown): value is GlossaryType =>
	typeof value === "string" && GLOSSARY_TYPES.includes(value as GlossaryType);

export { isGlossaryType };
