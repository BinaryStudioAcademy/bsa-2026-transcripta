import { PageStatus, type PageStatusValue } from "@transcripta/shared";

const UNDOABLE_PAGE_STATUSES: ReadonlySet<PageStatusValue> = new Set([
	PageStatus.CONFIRMED,
	PageStatus.CORRECTED,
	PageStatus.SKIPPED,
]);

export { UNDOABLE_PAGE_STATUSES };
