import { extractLexiconIds } from "./extract-lexicon-ids.helper.js";

const buildPageLexiconMap = (
	contextUsed: null | Record<string, unknown>,
	lexiconById: Map<number, { distinctPages: number; valueDisplay: string }>,
): Map<number, { distinctPages: number; valueDisplay: string }> => {
	return new Map(
		extractLexiconIds(contextUsed).flatMap((id) => {
			const lexicon = lexiconById.get(id);

			return lexicon ? [[id, lexicon] as const] : [];
		}),
	);
};

export { buildPageLexiconMap };
