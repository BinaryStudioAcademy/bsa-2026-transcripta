import { PageStatus } from "@transcripta/shared";

const statusByAction = {
	confirm: PageStatus.CONFIRMED,
	correct: PageStatus.CORRECTED,
	skip: PageStatus.SKIPPED,
} as const;

export { statusByAction };
