import { type LexiconContextSortable } from "../types/types.js";
import { compareLexiconForContext } from "./compare-lexicon-for-context.helper.js";

const sortLexiconForContext = <T extends LexiconContextSortable>(
	entries: T[],
): T[] => {
	return [...entries].sort(compareLexiconForContext);
};

export { sortLexiconForContext };
