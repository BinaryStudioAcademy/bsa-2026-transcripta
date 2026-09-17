const FALLBACK_REASON = "The page could not be read. Try re-reading it.";
const MAX_REASON_LENGTH = 140;

const getFailedReason = (lastError: null | string | undefined): string => {
	const firstLine = lastError?.split("\n")[0]?.trim();

	if (!firstLine) {
		return FALLBACK_REASON;
	}

	return firstLine.length > MAX_REASON_LENGTH
		? `${firstLine.slice(0, MAX_REASON_LENGTH)}вЂ¦`
		: firstLine;
};

export { getFailedReason };
