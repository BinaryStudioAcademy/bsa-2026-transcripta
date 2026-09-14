import { PageStatus, type PageStatusValue } from "@transcripta/shared";

const CLOSED_PAGE_STATUSES: PageStatusValue[] = [
	PageStatus.CONFIRMED,
	PageStatus.CORRECTED,
	PageStatus.SKIPPED,
	PageStatus.BLANK,
	PageStatus.FAILED,
];

export { CLOSED_PAGE_STATUSES };
