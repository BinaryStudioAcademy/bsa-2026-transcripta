import { type ContextLexiconMap } from "./context-lexicon-map.type.js";

type BuildContextWordsPayload = {
	lexiconById: ContextLexiconMap;
	text: string;
};

export { type BuildContextWordsPayload };
