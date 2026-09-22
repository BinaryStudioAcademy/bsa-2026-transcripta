import { type LexiconEntry } from "../types/types.js";

const renderLexiconEntry = (entry: LexiconEntry): string => {
	return `${entry.valueDisplay} (${entry.pageCount.toString()}x)`;
};

export { renderLexiconEntry };
