import {
	estimateTokens,
	fitToBudget,
	getEffectiveContextBudget,
} from "~/context/context.js";
import { Logger } from "~/libs/modules/logger/logger.js";
import { type Preset } from "~/modules/context/libs/types/types.js";
import { LexiconEntryModel } from "~/modules/lexicon/lexicon-entry.model.js";
import { PageRepository } from "~/modules/pages/page.repository.js";

import {
	DEFAULT_PRESET_SETTINGS,
	EMPTY_LENGTH,
	ONE,
} from "./libs/constants/constants.js";
import { ArrayIndex, ErrorMessage } from "./libs/enums/enums.js";
import {
	createContextHash,
	renderLexicon,
	renderLexiconEntry,
	renderNeighbouringPages,
	renderNeighbouringPagesEntry,
	renderSeedGlossary,
} from "./libs/helpers/helpers.js";
import {
	type BuiltContext,
	type ContextToFit,
	type ContextBuilder as IContextBuilder,
	type LexiconEntry,
	type PageWithText,
} from "./libs/types/types.js";

class ContextBuilder implements IContextBuilder {
	private logger: Logger;

	private pageRepository: PageRepository;

	constructor(logger: Logger, pageRepository: PageRepository) {
		this.logger = logger;
		this.pageRepository = pageRepository;
	}

	public async buildContext({
		documentId,
		pageNo,
		preset,
	}: {
		documentId: number;
		pageNo: number;
		preset: Preset;
	}): Promise<BuiltContext> {
		const contextToTrim: ContextToFit = {};

		const {
			lexiconTopK,
			maxContextTokens,
			minDistinctPages,
			model,
			neighbourPages,
		} = {
			...DEFAULT_PRESET_SETTINGS,
			...preset.settings,
		};

		if (preset.seedGlossary.length > EMPTY_LENGTH) {
			contextToTrim.seedGlossary = renderSeedGlossary(preset.seedGlossary);
		}

		// TODO: Replace with actual lexicon repository method (sorted lexiconTopK)
		let lexicon: LexiconEntry[] = [];
		try {
			lexicon = await LexiconEntryModel.query()
				.select("id", "valueDisplay", "freq")
				.where("documentId", documentId)
				.whereNull("invalidatedAt")
				.where("distinctPages", ">=", minDistinctPages)
				.orderBy([
					{ column: "distinctPages", order: "desc" },
					{ column: "freq", order: "desc" },
					{ column: "valueDisplay", order: "asc" },
				])
				.limit(lexiconTopK);
		} catch (error) {
			const errorMessage =
				error instanceof Error ? error.message : String(error);
			this.logger.error(
				`${ErrorMessage.LEXICON_SELECT_FAILED}: ${errorMessage}`,
			);
		}

		if (lexicon.length > EMPTY_LENGTH) {
			contextToTrim.lexiconEntries = lexicon.map((entry) =>
				renderLexiconEntry(entry),
			);
		}

		let neighbouringPages: PageWithText[] = [];
		try {
			neighbouringPages =
				await this.pageRepository.getPreviousVerifiedPagesText(
					documentId,
					pageNo,
					neighbourPages,
				);
		} catch (error) {
			const errorMessage =
				error instanceof Error ? error.message : String(error);
			this.logger.error(`${ErrorMessage.PAGES_SELECT_FAILED}: ${errorMessage}`);
		}

		if (neighbouringPages.length > EMPTY_LENGTH) {
			contextToTrim.neighbourPages = neighbouringPages.map((page) =>
				renderNeighbouringPagesEntry(page),
			);
		}

		const budget = getEffectiveContextBudget(maxContextTokens);
		const { blocks, lexiconEntryCount, neighbourPageCount } = await fitToBudget(
			{
				budget,
				model,
				...contextToTrim,
			},
		);

		if (lexiconEntryCount > EMPTY_LENGTH) {
			const lexiconIndex = contextToTrim.seedGlossary
				? ArrayIndex.SECOND
				: ArrayIndex.FIRST;
			blocks[lexiconIndex] = renderLexicon(blocks[lexiconIndex] as string);
		}

		if (neighbourPageCount > EMPTY_LENGTH) {
			blocks[blocks.length - ONE] = renderNeighbouringPages(
				blocks[blocks.length - ONE] as string,
			);
		}

		const contextHash = createContextHash(blocks);
		const estimateTokensResult = await estimateTokens(blocks, model);

		return {
			blocks,
			contextHash,
			tokenEstimate: estimateTokensResult.tokens,
			usedLexiconIds: lexicon
				.slice(ArrayIndex.FIRST, lexiconEntryCount)
				.map((l) => l.id),
			usedPageIds: neighbouringPages
				.slice(ArrayIndex.FIRST, neighbourPageCount)
				.map((p) => p.id),
		};
	}
}

export { ContextBuilder };
