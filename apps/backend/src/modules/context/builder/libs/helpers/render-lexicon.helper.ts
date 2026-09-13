import { LeadInPhrase } from "../enums/enums.js";
import { type LexiconEntry } from "../types/types.js";
import { renderLexiconEntry } from "./helpers.js";

const renderLexicon = (lexicon: LexiconEntry[]): string => {
	return `${LeadInPhrase.LEXICON}:\n${lexicon.map((entry) => renderLexiconEntry(entry)).join(", ")}`;
};

export { renderLexicon };
