import { PageStatus, type PageStatusValue } from "@transcripta/shared";

const CLOSED_PAGE_STATUSES: ReadonlySet<PageStatusValue> = new Set([
	PageStatus.BLANK,
	PageStatus.CONFIRMED,
	PageStatus.CORRECTED,
	PageStatus.FAILED,
	PageStatus.SKIPPED,
]);

export { CLOSED_PAGE_STATUSES };
