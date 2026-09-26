import { EMPTY_LENGTH, VerifyPageLexiconItemDto } from "@transcripta/shared";

import { lexiconExtractor } from "./lexicon-extractor/lexicon-extractor.js";
import { type LexiconRepository } from "./lexicon.repository.js";
import { normalizeLexiconValue } from "./libs/helpers/normalize-lexicon.helper.js";
import { type UpdateLexiconFromVerified } from "./libs/types/types.js";

class LexiconUpdateService {
	private lexiconRepository: LexiconRepository;

	public constructor({
		lexiconRepository,
	}: {
		lexiconRepository: LexiconRepository;
	}) {
		this.lexiconRepository = lexiconRepository;
	}

	public async updateLexiconFromVerifiedPage({
		documentId,
		minDistinctPages,
		outputSchema,
		pageNo,
		structured,
		text,
		trx,
	}: UpdateLexiconFromVerified): Promise<VerifyPageLexiconItemDto[]> {
		const extractedEntities = lexiconExtractor.extractEntities(
			text,
			structured,
			outputSchema ?? undefined,
		);

		if (extractedEntities.length === EMPTY_LENGTH) {
			return [];
		}

		const lexiconPayload = extractedEntities.map((entity) => ({
			documentId,
			kind: entity.kind,
			pageNo,
			valueDisplay: entity.value,
			valueNormalized: normalizeLexiconValue(entity.value),
		}));

		const entries = await this.lexiconRepository.upsertFromPage(
			lexiconPayload,
			trx,
		);

		return entries.map((entry) => {
			const { distinctPages, id, valueDisplay } = entry.toObject();

			return {
				distinctPages,
				id,
				inContext: distinctPages >= minDistinctPages,
				word: valueDisplay,
			};
		});
	}
}

export { LexiconUpdateService };
