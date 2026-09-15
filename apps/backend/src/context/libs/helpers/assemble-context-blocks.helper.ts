import {
	CONTEXT_ASSEMBLY_ORDER,
	EMPTY_TEXT_LENGTH,
} from "../constants/constants.js";
import { type ContextBlockParts } from "../types/types.js";

const assembleContextBlocks = (parts: ContextBlockParts): string[] => {
	const blocks: string[] = [];

	for (const kind of CONTEXT_ASSEMBLY_ORDER) {
		const block = parts[kind];

		if (block !== undefined && block.length > EMPTY_TEXT_LENGTH) {
			blocks.push(block);
		}
	}

	return blocks;
};

export { assembleContextBlocks };
