import { PageStatus, PageVerificationAction } from "@transcripta/shared";

const PAGE_STATUS_BY_ACTION = {
	[PageVerificationAction.CONFIRM]: PageStatus.CONFIRMED,
	[PageVerificationAction.CORRECT]: PageStatus.CORRECTED,
	[PageVerificationAction.SKIP]: PageStatus.SKIPPED,
} as const;

export { PAGE_STATUS_BY_ACTION };
