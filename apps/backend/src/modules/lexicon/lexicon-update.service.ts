import {
	EMPTY_LENGTH,
	LexiconEntrySource,
	VerifyPageLexiconItemDto,
} from "@transcripta/shared";

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
		source,
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
			source,
			valueDisplay: entity.value,
			valueNormalized: normalizeLexiconValue(entity.value),
		}));

		const entries = await this.lexiconRepository.upsertFromPage(
			lexiconPayload,
			trx,
		);

		return entries.map((entry) => {
			const {
				distinctPages,
				id,
				source: entrySource,
				valueDisplay,
			} = entry.toObject();

			return {
				distinctPages,
				id,
				inContext:
					entrySource === LexiconEntrySource.HUMAN ||
					distinctPages >= minDistinctPages,
				word: valueDisplay,
			};
		});
	}
}

export { LexiconUpdateService };
