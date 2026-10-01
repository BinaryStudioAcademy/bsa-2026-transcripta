import { type PageStatusValue } from "@transcripta/shared";

import { PageStatus } from "../enums/enums.js";

const CLOSED_PAGE_STATUSES: ReadonlySet<PageStatusValue> = new Set([
	PageStatus.BLANK,
	PageStatus.CONFIRMED,
	PageStatus.CORRECTED,
	PageStatus.FAILED,
	PageStatus.SKIPPED,
]);

export { CLOSED_PAGE_STATUSES };
