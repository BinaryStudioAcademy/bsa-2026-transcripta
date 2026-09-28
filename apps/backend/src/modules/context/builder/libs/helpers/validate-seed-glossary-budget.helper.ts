import {
	checkSeedGlossaryBudget,
	estimateTokens,
	type SeedGlossaryBudgetCheckResult,
} from "~/context/context.js";
import { type SeedGlossary } from "~/modules/context/libs/types/types.js";

import {
	DEFAULT_PRESET_SETTINGS,
	EMPTY_LENGTH,
} from "../constants/constants.js";
import { renderSeedGlossary } from "./render-seed-glossary.helper.js";

type ValidateSeedGlossaryBudgetParameters = {
	maxContextTokens?: number;
	model?: string;
	seedGlossary: SeedGlossary;
};

const validateSeedGlossaryBudget = async ({
	maxContextTokens = DEFAULT_PRESET_SETTINGS.maxContextTokens,
	model = DEFAULT_PRESET_SETTINGS.model,
	seedGlossary,
}: ValidateSeedGlossaryBudgetParameters): Promise<SeedGlossaryBudgetCheckResult> => {
	if (seedGlossary.length === EMPTY_LENGTH) {
		return { ok: true };
	}

	const rendered = renderSeedGlossary(seedGlossary);

	if (rendered.length === EMPTY_LENGTH) {
		return { ok: true };
	}

	const { tokens } = await estimateTokens([rendered], model);

	return checkSeedGlossaryBudget(tokens, maxContextTokens);
};

export { validateSeedGlossaryBudget };
