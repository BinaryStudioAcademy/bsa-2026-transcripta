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

// What the user did not pay because the transcription came from the shared
// cache instead of a fresh model call.
//
// A cache hit is stored with `cost_usd = 0` but keeps the token counts of the
// call that originally produced it, so the avoided cost is the price of those
// tokens at the recorded model rate. The transcription row stores no cache key,
// which is why the amount is derived rather than read from
// `transcription_cache.cost_usd`.
//
// `model` is null on hand-typed transcriptions and on rows written before the
// column existed, and `calculateTokenCost` dereferences the rate without a
// guard, so an unpriced model reports no saving rather than throwing inside a
// page-list request.
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
