import { PageStatus } from "@transcripta/shared";

const StatusByAction = {
	confirm: PageStatus.CONFIRMED,
	correct: PageStatus.CORRECTED,
	skip: PageStatus.SKIPPED,
} as const;

export { StatusByAction };
