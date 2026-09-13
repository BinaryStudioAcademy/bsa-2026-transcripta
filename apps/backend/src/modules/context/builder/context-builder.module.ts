import { estimateTokens } from "~/context/context.js";
import { type Preset } from "~/modules/context/libs/types/types.js";
import { PageRepository } from "~/modules/pages/pages.js";

import { EMPTY_LENGTH, MIN_LEXICON_WORDS } from "./libs/constants/constants.js";
import { DefaultPresetSettings, LeadInPhrase } from "./libs/enums/enums.js";
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
	type ContextBuilder as IContextBuilder,
	type LexiconEntry,
	type PageWithText,
} from "./libs/types/types.js";

class ContextBuilder implements IContextBuilder {
	private pageRepository: PageRepository;

	constructor(pageRepository: PageRepository) {
		this.pageRepository = pageRepository;
	}

	private async trimContextToBudget({
		blocks,
		budget,
		lexicon,
		model,
		neighbouringPages,
	}: {
		blocks: string[];
		budget: number;
		lexicon: LexiconEntry[];
		model: string;
		neighbouringPages: PageWithText[];
	}): Promise<{
		fittedBlocks: string[];
		usedLexicon: LexiconEntry[];
		usedPages: PageWithText[];
		usedTokens: number;
	}> {
		let { tokens: currentTokens } = await estimateTokens(blocks, model);

		if (currentTokens <= budget) {
			return {
				fittedBlocks: blocks,
				usedLexicon: lexicon,
				usedPages: neighbouringPages,
				usedTokens: currentTokens,
			};
		}

		if (lexicon.length > MIN_LEXICON_WORDS) {
			currentTokens = await this.trimLexiconToBudget({
				budget,
				currentTokens,
				lexicon,
				model,
			});

			for (let index = 0; index < blocks.length; index++) {
				const currentBlock = blocks[index] as string;

				if (currentBlock.startsWith(LeadInPhrase.LEXICON)) {
					blocks[index] = renderLexicon(lexicon);
					break;
				}
			}
		}

		if (currentTokens <= budget) {
			return {
				fittedBlocks: blocks,
				usedLexicon: lexicon,
				usedPages: neighbouringPages,
				usedTokens: currentTokens,
			};
		}

		if (neighbouringPages.length > EMPTY_LENGTH) {
			await this.trimNeighbouringPagesToBudget({
				budget,
				currentTokens,
				model,
				neighbouringPages,
			});

			for (let index = 0; index < blocks.length; index++) {
				const currentBlock = blocks[index] as string;

				if (currentBlock.startsWith(LeadInPhrase.NEIGHBOURING_PAGES)) {
					blocks[index] = renderNeighbouringPages(neighbouringPages);
					break;
				}
			}
		}

		return {
			fittedBlocks: blocks,
			usedLexicon: lexicon,
			usedPages: neighbouringPages,
			usedTokens: currentTokens,
		};
	}

	private async trimLexiconToBudget({
		budget,
		currentTokens,
		lexicon,
		model,
	}: {
		budget: number;
		currentTokens: number;
		lexicon: LexiconEntry[];
		model: string;
	}): Promise<number> {
		while (lexicon.length > MIN_LEXICON_WORDS && currentTokens > budget) {
			const lexiconEntry = lexicon.pop() as LexiconEntry;
			const { tokens: lexiconEntryTokens } = await estimateTokens(
				[renderLexiconEntry(lexiconEntry)],
				model,
			);
			currentTokens -= lexiconEntryTokens;
		}

		return currentTokens;
	}

	private async trimNeighbouringPagesToBudget({
		budget,
		currentTokens,
		model,
		neighbouringPages,
	}: {
		budget: number;
		currentTokens: number;
		model: string;
		neighbouringPages: PageWithText[];
	}): Promise<number> {
		while (neighbouringPages.length > EMPTY_LENGTH && currentTokens > budget) {
			const page = neighbouringPages.pop() as PageWithText;
			const { tokens: pageTokens } = await estimateTokens(
				[renderNeighbouringPagesEntry(page)],
				model,
			);
			currentTokens -= pageTokens;
		}

		return currentTokens;
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
		const blocks: string[] = [];
		// eslint-disable-next-line sonarjs/no-unused-vars, sonarjs/no-dead-store, @typescript-eslint/no-unused-vars
		const { lexiconTopK, maxContextTokens, model, neighbourPages } = {
			...DefaultPresetSettings,
			...preset.settings,
		};

		if (preset.seedGlossary.length > EMPTY_LENGTH) {
			blocks.push(renderSeedGlossary(preset.seedGlossary));
		}

		// TODO: Replace with actual lexicon repository method (sorted lexiconTopK)
		const lexicon: LexiconEntry[] = [];
		if (lexicon.length > EMPTY_LENGTH) {
			blocks.push(renderLexicon(lexicon));
		}

		const neighbouringPages =
			await this.pageRepository.getPreviousVerifiedPagesText(
				documentId,
				pageNo,
				neighbourPages,
			);

		if (neighbouringPages.length > EMPTY_LENGTH) {
			blocks.push(renderNeighbouringPages(neighbouringPages));
		}

		const { fittedBlocks, usedLexicon, usedPages, usedTokens } =
			await this.trimContextToBudget({
				blocks,
				budget: maxContextTokens,
				lexicon,
				model,
				neighbouringPages,
			});

		const contextHash = createContextHash(fittedBlocks);

		return {
			blocks: fittedBlocks,
			contextHash,
			tokenEstimate: usedTokens,
			usedLexiconIds: usedLexicon.map((l) => l.id),
			usedPageIds: usedPages.map((p) => p.id),
		};
	}
}

export { ContextBuilder };
