import {
	BINARY_SEARCH_HALF_DIVISOR,
	EMPTY_TEXT_LENGTH,
	INDEX_STEP,
	LEXICON_MIN_RETAINED,
	MIN_NEIGHBOUR_PAGES_RETAINED,
} from "../constants/constants.js";
import {
	type EstimateTokensFunction,
	type FitToBudgetParameters,
	type FitToBudgetResult,
} from "../types/types.js";
import { assembleBudgetedBlocks } from "./assemble-budgeted-blocks.helper.js";

type BudgetCheckParameters = {
	budget: number;
	estimateTokens: EstimateTokensFunction;
	lexiconEntries: string[];
	model: string;
	neighbourPages: string[];
	seedGlossary?: string;
};

const buildResult = ({
	lexiconEntries,
	neighbourPages,
	seedGlossary,
	wasReduced,
}: {
	lexiconEntries: string[];
	neighbourPages: string[];
	seedGlossary?: string;
	wasReduced: boolean;
}): FitToBudgetResult => {
	return {
		blocks: assembleBudgetedBlocks({
			lexiconEntries,
			neighbourPages,
			...(seedGlossary === undefined ? {} : { seedGlossary }),
		}),
		lexiconEntryCount: lexiconEntries.length,
		neighbourPageCount: neighbourPages.length,
		wasReduced,
	};
};

const fitsBudget = async ({
	budget,
	estimateTokens,
	lexiconEntries,
	model,
	neighbourPages,
	seedGlossary,
}: BudgetCheckParameters): Promise<boolean> => {
	const blocks = assembleBudgetedBlocks({
		lexiconEntries,
		neighbourPages,
		...(seedGlossary === undefined ? {} : { seedGlossary }),
	});
	const { tokens } = await estimateTokens(blocks, model);

	return tokens <= budget;
};

const shrinkLexiconToFit = async ({
	budget,
	estimateTokens,
	lexiconEntries,
	model,
	neighbourPages,
	seedGlossary,
}: BudgetCheckParameters): Promise<string[]> => {
	if (lexiconEntries.length === EMPTY_TEXT_LENGTH) {
		return lexiconEntries;
	}

	const fitsFull = await fitsBudget({
		budget,
		estimateTokens,
		lexiconEntries,
		model,
		neighbourPages,
		...(seedGlossary === undefined ? {} : { seedGlossary }),
	});

	if (fitsFull) {
		return lexiconEntries;
	}

	if (lexiconEntries.length < LEXICON_MIN_RETAINED) {
		return [];
	}

	let low = LEXICON_MIN_RETAINED;
	let high = lexiconEntries.length;
	let bestSize: null | number = null;

	while (low <= high) {
		const mid = Math.floor((low + high) / BINARY_SEARCH_HALF_DIVISOR);
		const candidate = lexiconEntries.slice(EMPTY_TEXT_LENGTH, mid);
		const fits = await fitsBudget({
			budget,
			estimateTokens,
			lexiconEntries: candidate,
			model,
			neighbourPages,
			...(seedGlossary === undefined ? {} : { seedGlossary }),
		});

		if (fits) {
			bestSize = mid;
			low = mid + INDEX_STEP;
		} else {
			high = mid - INDEX_STEP;
		}
	}

	if (bestSize === null) {
		return [];
	}

	return lexiconEntries.slice(EMPTY_TEXT_LENGTH, bestSize);
};

const fitToBudget = async (
	{
		budget,
		lexiconEntries = [],
		model,
		neighbourPages = [],
		seedGlossary,
	}: FitToBudgetParameters,
	estimateTokens: EstimateTokensFunction,
): Promise<FitToBudgetResult> => {
	const initialLexicon = [...lexiconEntries];
	const initialNeighbours = [...neighbourPages];
	const seed = seedGlossary === undefined ? {} : { seedGlossary };

	const fitsInitial = await fitsBudget({
		budget,
		estimateTokens,
		lexiconEntries: initialLexicon,
		model,
		neighbourPages: initialNeighbours,
		...seed,
	});

	if (fitsInitial) {
		return buildResult({
			lexiconEntries: initialLexicon,
			neighbourPages: initialNeighbours,
			wasReduced: false,
			...seed,
		});
	}

	let lexicon = await shrinkLexiconToFit({
		budget,
		estimateTokens,
		lexiconEntries: initialLexicon,
		model,
		neighbourPages: initialNeighbours,
		...seed,
	});

	const fitsAfterLexicon = await fitsBudget({
		budget,
		estimateTokens,
		lexiconEntries: lexicon,
		model,
		neighbourPages: initialNeighbours,
		...seed,
	});

	if (fitsAfterLexicon) {
		return buildResult({
			lexiconEntries: lexicon,
			neighbourPages: initialNeighbours,
			wasReduced: true,
			...seed,
		});
	}

	lexicon = [];

	let neighbours = [...initialNeighbours];

	while (neighbours.length > MIN_NEIGHBOUR_PAGES_RETAINED) {
		neighbours = neighbours.slice(
			EMPTY_TEXT_LENGTH,
			neighbours.length - MIN_NEIGHBOUR_PAGES_RETAINED,
		);

		const fits = await fitsBudget({
			budget,
			estimateTokens,
			lexiconEntries: lexicon,
			model,
			neighbourPages: neighbours,
			...seed,
		});

		if (fits) {
			return buildResult({
				lexiconEntries: lexicon,
				neighbourPages: neighbours,
				wasReduced: true,
				...seed,
			});
		}
	}

	if (neighbours.length === MIN_NEIGHBOUR_PAGES_RETAINED) {
		const fitsOne = await fitsBudget({
			budget,
			estimateTokens,
			lexiconEntries: lexicon,
			model,
			neighbourPages: neighbours,
			...seed,
		});

		if (fitsOne) {
			return buildResult({
				lexiconEntries: lexicon,
				neighbourPages: neighbours,
				wasReduced: true,
				...seed,
			});
		}

		neighbours = [];
	}

	return buildResult({
		lexiconEntries: lexicon,
		neighbourPages: neighbours,
		wasReduced: true,
		...seed,
	});
};

export { fitToBudget };
