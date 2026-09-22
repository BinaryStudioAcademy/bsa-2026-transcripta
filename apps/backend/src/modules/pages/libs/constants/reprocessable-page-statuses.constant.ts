import { PageStatus, type PageStatusValue } from "@transcripta/shared";

const REPROCESSABLE_PAGE_STATUSES: ReadonlySet<PageStatusValue> = new Set([
	PageStatus.BLANK,
	PageStatus.FAILED,
]);

export { REPROCESSABLE_PAGE_STATUSES };
