import {
	EMPTY_LENGTH,
	LexiconEntrySource,
	VerifyPageLexiconItemDto,
} from "@transcripta/shared";

import { lexiconExtractor } from "./lexicon-extractor/lexicon-extractor.js";
import { type LexiconRepository } from "./lexicon.repository.js";
import { normalizeLexiconValue } from "./libs/helpers/normalize-lexicon.helper.js";
import {
	type EnqueuePageTranscribe,
	type UpdateLexiconFromVerified,
} from "./libs/types/types.js";

class LexiconUpdateService {
	private enqueuePageTranscribe: EnqueuePageTranscribe;

	private lexiconRepository: LexiconRepository;

	public constructor({
		enqueuePageTranscribe,
		lexiconRepository,
	}: {
		enqueuePageTranscribe: EnqueuePageTranscribe;
		lexiconRepository: LexiconRepository;
	}) {
		this.enqueuePageTranscribe = enqueuePageTranscribe;
		this.lexiconRepository = lexiconRepository;
	}

	// The transcription window keeps at most a handful of pages open at a time,
	// so the pages ahead of a correction are few. They were transcribed without
	// the corrected word, so they are queued again; pages the user already
	// verified are left untouched.
	public async reprocessStalePagesAhead({
		documentId,
		pageNo,
	}: {
		documentId: number;
		pageNo: number;
	}): Promise<number> {
		const stalePages =
			await this.lexiconRepository.findStaleTranscribedPagesAhead(
				documentId,
				pageNo,
			);

		if (stalePages.length === EMPTY_LENGTH) {
			return EMPTY_LENGTH;
		}

		const queuedCount = await this.lexiconRepository.queueTranscribedPages(
			stalePages.map((page) => page.id),
		);

		await Promise.all(
			stalePages.map((page) =>
				this.enqueuePageTranscribe({
					documentId: page.documentId,
					pageId: page.id,
					pageNo: page.pageNo,
				}),
			),
		);

		return queuedCount;
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
