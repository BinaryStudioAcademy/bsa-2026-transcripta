import { DocumentStatus, type ValueOf } from "@transcripta/shared";

const TRANSCRIBABLE_STATUSES = new Set<ValueOf<typeof DocumentStatus>>([
	DocumentStatus.PROCESSING,
	DocumentStatus.READY,
]);

export { TRANSCRIBABLE_STATUSES };
