import { type PageStatusValue } from "@transcripta/shared";

import { PageStatus } from "../enums/enums.js";

const COMPLETED_PAGE_STATUSES: ReadonlySet<PageStatusValue> = new Set([
	PageStatus.BLANK,
	PageStatus.CONFIRMED,
	PageStatus.CORRECTED,
	PageStatus.SKIPPED,
]);

export { COMPLETED_PAGE_STATUSES };
