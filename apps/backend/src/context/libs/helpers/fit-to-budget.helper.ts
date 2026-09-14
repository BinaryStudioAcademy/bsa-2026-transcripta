import {
	BINARY_SEARCH_HALF_DIVISOR,
	CONTEXT_HASH_SEPARATOR,
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
import { estimateTokensByChars } from "./estimate-tokens-by-chars.helper.js";

type BudgetUnits = {
	lexiconEntries: string[];
	neighbourPages: string[];
	seedGlossary?: string;
};

type CharBudgetParameters = BudgetUnits & {
	budget: number;
};

type ExactCountParameters = BudgetUnits & {
	estimateTokens: EstimateTokensFunction;
	model: string;
};

const buildResult = ({
	lexiconEntries,
	neighbourPages,
	seedGlossary,
	wasReduced,
}: BudgetUnits & {
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

const toBlocks = ({
	lexiconEntries,
	neighbourPages,
	seedGlossary,
}: BudgetUnits): string[] => {
	return assembleBudgetedBlocks({
		lexiconEntries,
		neighbourPages,
		...(seedGlossary === undefined ? {} : { seedGlossary }),
	});
};

const estimateUnitsByChars = (units: BudgetUnits): number => {
	return estimateTokensByChars(toBlocks(units).join(CONTEXT_HASH_SEPARATOR));
};

const fitsByChars = (budget: number, units: BudgetUnits): boolean => {
	return estimateUnitsByChars(units) <= budget;
};

const countExact = async ({
	estimateTokens,
	lexiconEntries,
	model,
	neighbourPages,
	seedGlossary,
}: ExactCountParameters): Promise<number> => {
	const { tokens } = await estimateTokens(
		toBlocks({
			lexiconEntries,
			neighbourPages,
			...(seedGlossary === undefined ? {} : { seedGlossary }),
		}),
		model,
	);

	return tokens;
};

const scaleBudgetForChars = ({
	budget,
	charTokens,
	exactTokens,
}: {
	budget: number;
	charTokens: number;
	exactTokens: number;
}): number => {
	if (charTokens === EMPTY_TEXT_LENGTH || exactTokens === EMPTY_TEXT_LENGTH) {
		return EMPTY_TEXT_LENGTH;
	}

	return Math.floor((budget * charTokens) / exactTokens);
};

const shrinkLexiconByChars = ({
	budget,
	lexiconEntries,
	neighbourPages,
	seedGlossary,
}: CharBudgetParameters): string[] => {
	if (lexiconEntries.length === EMPTY_TEXT_LENGTH) {
		return lexiconEntries;
	}

	const seed = seedGlossary === undefined ? {} : { seedGlossary };

	if (
		fitsByChars(budget, {
			lexiconEntries,
			neighbourPages,
			...seed,
		})
	) {
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

		if (
			fitsByChars(budget, {
				lexiconEntries: candidate,
				neighbourPages,
				...seed,
			})
		) {
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

const shrinkNeighboursByChars = ({
	budget,
	neighbourPages,
	seedGlossary,
}: {
	budget: number;
	neighbourPages: string[];
	seedGlossary?: string;
}): string[] => {
	const seed = seedGlossary === undefined ? {} : { seedGlossary };
	let neighbours = [...neighbourPages];

	if (
		fitsByChars(budget, {
			lexiconEntries: [],
			neighbourPages: neighbours,
			...seed,
		})
	) {
		return neighbours;
	}

	while (neighbours.length > MIN_NEIGHBOUR_PAGES_RETAINED) {
		neighbours = neighbours.slice(
			EMPTY_TEXT_LENGTH,
			neighbours.length - MIN_NEIGHBOUR_PAGES_RETAINED,
		);

		if (
			fitsByChars(budget, {
				lexiconEntries: [],
				neighbourPages: neighbours,
				...seed,
			})
		) {
			return neighbours;
		}
	}

	return [];
};

const fitLexiconToBudget = async ({
	budget,
	estimateTokens,
	lexiconEntries,
	model,
	neighbourPages,
	seedGlossary,
}: ExactCountParameters & {
	budget: number;
}): Promise<null | string[]> => {
	const seed = seedGlossary === undefined ? {} : { seedGlossary };
	let lexicon = shrinkLexiconByChars({
		budget,
		lexiconEntries,
		neighbourPages,
		...seed,
	});

	const units = {
		lexiconEntries: lexicon,
		neighbourPages,
		...seed,
	};
	const exactTokens = await countExact({
		estimateTokens,
		model,
		...units,
	});

	if (exactTokens <= budget) {
		return lexicon;
	}

	if (lexicon.length === EMPTY_TEXT_LENGTH) {
		return null;
	}

	const scaledBudget = scaleBudgetForChars({
		budget,
		charTokens: estimateUnitsByChars(units),
		exactTokens,
	});

	if (scaledBudget >= budget) {
		return null;
	}

	lexicon = shrinkLexiconByChars({
		budget: scaledBudget,
		lexiconEntries,
		neighbourPages,
		...seed,
	});

	const retryTokens = await countExact({
		estimateTokens,
		lexiconEntries: lexicon,
		model,
		neighbourPages,
		...seed,
	});

	if (retryTokens <= budget) {
		return lexicon;
	}

	return null;
};

const fitNeighboursToBudget = async ({
	budget,
	estimateTokens,
	model,
	neighbourPages,
	seedGlossary,
}: {
	budget: number;
	estimateTokens: EstimateTokensFunction;
	model: string;
	neighbourPages: string[];
	seedGlossary?: string;
}): Promise<string[]> => {
	const seed = seedGlossary === undefined ? {} : { seedGlossary };
	let neighbours = shrinkNeighboursByChars({
		budget,
		neighbourPages,
		...seed,
	});

	if (neighbours.length === EMPTY_TEXT_LENGTH) {
		return [];
	}

	const units = {
		lexiconEntries: [],
		neighbourPages: neighbours,
		...seed,
	};
	const exactTokens = await countExact({
		estimateTokens,
		model,
		...units,
	});

	if (exactTokens <= budget) {
		return neighbours;
	}

	const scaledBudget = scaleBudgetForChars({
		budget,
		charTokens: estimateUnitsByChars(units),
		exactTokens,
	});

	if (scaledBudget >= budget) {
		return [];
	}

	neighbours = shrinkNeighboursByChars({
		budget: scaledBudget,
		neighbourPages,
		...seed,
	});

	if (neighbours.length === EMPTY_TEXT_LENGTH) {
		return [];
	}

	const retryTokens = await countExact({
		estimateTokens,
		lexiconEntries: [],
		model,
		neighbourPages: neighbours,
		...seed,
	});

	if (retryTokens <= budget) {
		return neighbours;
	}

	return [];
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

	const initialTokens = await countExact({
		estimateTokens,
		lexiconEntries: initialLexicon,
		model,
		neighbourPages: initialNeighbours,
		...seed,
	});

	if (initialTokens <= budget) {
		return buildResult({
			lexiconEntries: initialLexicon,
			neighbourPages: initialNeighbours,
			wasReduced: false,
			...seed,
		});
	}

	const fittedLexicon = await fitLexiconToBudget({
		budget,
		estimateTokens,
		lexiconEntries: initialLexicon,
		model,
		neighbourPages: initialNeighbours,
		...seed,
	});

	if (fittedLexicon !== null) {
		return buildResult({
			lexiconEntries: fittedLexicon,
			neighbourPages: initialNeighbours,
			wasReduced: true,
			...seed,
		});
	}

	const fittedNeighbours = await fitNeighboursToBudget({
		budget,
		estimateTokens,
		model,
		neighbourPages: initialNeighbours,
		...seed,
	});

	return buildResult({
		lexiconEntries: [],
		neighbourPages: fittedNeighbours,
		wasReduced: true,
		...seed,
	});
};

export { fitToBudget };
