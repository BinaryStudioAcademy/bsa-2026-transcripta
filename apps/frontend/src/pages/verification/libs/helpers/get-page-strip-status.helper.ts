import { PageStatus } from "../enums/enums.js";
import { type PageStatusValue } from "../types/types.js";

const getPageStripStatus = (
	status: PageStatusValue | undefined,
	isCurrent: boolean,
): string => {
	if (isCurrent) {
		return "current";
	}

	switch (status) {
		case PageStatus.CONFIRMED: {
			return "confirmed";
		}

		case PageStatus.CORRECTED: {
			return "corrected";
		}

		case PageStatus.FAILED: {
			return "error";
		}

		case PageStatus.QUEUED: {
			return "queued";
		}

		case PageStatus.SKIPPED: {
			return "skipped";
		}

		case PageStatus.TRANSCRIBED: {
			return "ready";
		}

		case PageStatus.TRANSCRIBING: {
			return "running";
		}

		default: {
			return "ready";
		}
	}
};

export { getPageStripStatus };
