import { LeadInPhrase } from "../enums/enums.js";

const renderLexicon = (lexicon: string): string => {
	return `${LeadInPhrase.LEXICON}:\n${lexicon}`;
};

export { renderLexicon };
