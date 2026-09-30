import { PageStatus, type PageStatusValue } from "@transcripta/shared";

const TRANSCRIPTION_STARTED_PAGE_STATUSES: ReadonlySet<PageStatusValue> =
	new Set([
		PageStatus.FAILED,
		PageStatus.QUEUED,
		PageStatus.TRANSCRIBED,
		PageStatus.TRANSCRIBING,
	]);

export { TRANSCRIPTION_STARTED_PAGE_STATUSES };
