import {
	CONTEXT_HASH_SEPARATOR,
	EMPTY_TEXT_LENGTH,
} from "../constants/constants.js";
import { type ContextBlockParts } from "../types/types.js";
import { assembleContextBlocks } from "./assemble-context-blocks.helper.js";

const assembleBudgetedBlocks = ({
	lexiconEntries,
	neighbourPages,
	seedGlossary,
}: {
	lexiconEntries: string[];
	neighbourPages: string[];
	seedGlossary?: string;
}): string[] => {
	const parts: ContextBlockParts = {};

	if (lexiconEntries.length > EMPTY_TEXT_LENGTH) {
		parts.lexicon = lexiconEntries.join(CONTEXT_HASH_SEPARATOR);
	}

	if (neighbourPages.length > EMPTY_TEXT_LENGTH) {
		parts.neighbours = neighbourPages.join(CONTEXT_HASH_SEPARATOR);
	}

	if (seedGlossary !== undefined) {
		parts.seedGlossary = seedGlossary;
	}

	return assembleContextBlocks(parts);
};

export { assembleBudgetedBlocks };
