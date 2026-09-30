import { type ModelIdValue } from "@transcripta/shared";

import {
	MODEL_RATES,
	NO_SAVINGS_USD,
	SAVED_USD_DECIMALS,
} from "../constants/constants.js";
import { calculateTokenCost } from "./pricing.helper.js";

type CalculateSavedUsdPayload = {
	fromCache: boolean;
	inputTokens: number;
	model: null | string;
	outputTokens: number;
};

const calculateSavedUsd = ({
	fromCache,
	inputTokens,
	model,
	outputTokens,
}: CalculateSavedUsdPayload): string => {
	const isPriced = model !== null && model in MODEL_RATES;

	if (!fromCache || !isPriced) {
		return NO_SAVINGS_USD;
	}

	return calculateTokenCost({
		inputTokens,
		modelId: model as ModelIdValue,
		outputTokens,
	}).toFixed(SAVED_USD_DECIMALS);
};

export { calculateSavedUsd };
