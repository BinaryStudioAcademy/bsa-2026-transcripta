import { EMPTY_LENGTH } from "@transcripta/shared";

import { TRANSCRIPTION_OUTPUT_RULES } from "./libs/constants/constants.js";
import { type Preset } from "./libs/types/types.js";

const buildUserPrompt = (preset: Preset, contextBlocks: string[]): string => {
	const parts: string[] = [];

	if (preset.instructions) {
		parts.push(`<preset>\n${preset.instructions}\n</preset>`);
	}

	if (contextBlocks.length > EMPTY_LENGTH) {
		parts.push(`<context>\n${contextBlocks.join("\n\n")}\n</context>`);
	}

	if (preset.outputSchema) {
		parts.push(`<schema>\n${JSON.stringify(preset.outputSchema)}\n</schema>`);
	}

	parts.push(`<output_rules>\n${TRANSCRIPTION_OUTPUT_RULES}\n</output_rules>`);

	return parts.join("\n\n");
};

export { buildUserPrompt };
