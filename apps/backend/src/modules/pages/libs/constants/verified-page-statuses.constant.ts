import { PageStatus, type PageStatusValue } from "@transcripta/shared";

const VERIFIED_PAGE_STATUSES: readonly PageStatusValue[] = [
	PageStatus.CONFIRMED,
	PageStatus.CORRECTED,
];

export { VERIFIED_PAGE_STATUSES };
