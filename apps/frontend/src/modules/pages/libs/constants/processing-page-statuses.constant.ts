import { type PageStatusValue } from "@transcripta/shared";

import { PageStatus } from "../enums/enums.js";

const PROCESSING_PAGE_STATUSES: ReadonlySet<PageStatusValue> = new Set([
	PageStatus.PENDING,
	PageStatus.QUEUED,
	PageStatus.TRANSCRIBING,
]);

export { PROCESSING_PAGE_STATUSES };
