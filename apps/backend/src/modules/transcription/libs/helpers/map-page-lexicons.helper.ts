import { type ContextLexiconMap } from "../types/types.js";
import { extractLexiconIds } from "./extract-lexicon-ids.helper.js";

const mapPageLexicons = (
	contextUsed: null | Record<string, unknown>,
	lexiconById: ContextLexiconMap,
): ContextLexiconMap => {
	return new Map(
		extractLexiconIds(contextUsed).flatMap((id) => {
			const lexicon = lexiconById.get(id);

			return lexicon ? [[id, lexicon] as const] : [];
		}),
	);
};

export { mapPageLexicons };
