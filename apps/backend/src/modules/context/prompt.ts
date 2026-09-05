import { type Preset } from "./libs/types/types.js";

const ZERO = 0;

const buildUserPrompt = (preset: Preset, contextBlocks: string[]): string => {
	const parts: string[] = [];

	if (preset.instructions) {
		parts.push(`<preset>\n${preset.instructions}\n</preset>`);
	}

	if (contextBlocks.length > ZERO) {
		parts.push(`<context>\n${contextBlocks.join("\n\n")}\n</context>`);
	}

	if (preset.outputSchema) {
		parts.push(`<schema>\n${JSON.stringify(preset.outputSchema)}\n</schema>`);
	}

	return parts.join("\n\n");
};

export { buildUserPrompt };
