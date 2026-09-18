import { FIRST_INDEX } from "~/libs/constants/common.constants.js";

const FALLBACK_REASON = "The page could not be read. Try re-reading it.";
const MAX_REASON_LENGTH = 140;

// Mirrors apps/backend/src/modules/jobs/libs/enums/transcribe-failure-reason.enum.ts
// — keep these in sync if the backend enum changes.
const KNOWN_FAILURE_REASONS: Record<string, string> = {
	budget_exceeded:
		"The document ran out of budget before this page could be read.",
	invalid_model_output: "The model's answer couldn't be understood.",
	model_call_failed: "The reading service didn't respond in time.",
	page_image_missing: "This page's scan is missing.",
	page_image_sha_missing: "This page's scan is missing.",
	preset_not_found: "The reading preset for this document is missing.",
	unexpected_error: "Something unexpected went wrong while reading this page.",
};

const getFailedReason = (lastError: null | string | undefined): string => {
	if (!lastError) {
		return FALLBACK_REASON;
	}

	const knownReason = KNOWN_FAILURE_REASONS[lastError];

	if (knownReason) {
		return knownReason;
	}

	const [firstLine = ""] = lastError.split("\n");
	const trimmed = firstLine.trim();

	if (!trimmed) {
		return FALLBACK_REASON;
	}

	return trimmed.length > MAX_REASON_LENGTH
		? `${trimmed.slice(FIRST_INDEX, MAX_REASON_LENGTH)}…`
		: trimmed;
};

export { getFailedReason };
