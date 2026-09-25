import { PageStatus } from "../enums/enums.js";
import { type PageStatusValue } from "../types/types.js";

const getPageStripStatus = (status: PageStatusValue | undefined): string => {
	switch (status) {
		case PageStatus.BLANK: {
			return "blank";
		}

		case PageStatus.CONFIRMED: {
			return "confirmed";
		}

		case PageStatus.CORRECTED: {
			return "corrected";
		}

		case PageStatus.FAILED: {
			return "error";
		}

		case PageStatus.PENDING: {
			return "queued";
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
