import { FIRST_INDEX } from "~/libs/constants/common.constants.js";

const FALLBACK_REASON = "The page could not be read. Try re-reading it.";
const MAX_REASON_LENGTH = 140;

const getFailedReason = (lastError: null | string | undefined): string => {
	if (!lastError) {
		return FALLBACK_REASON;
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
