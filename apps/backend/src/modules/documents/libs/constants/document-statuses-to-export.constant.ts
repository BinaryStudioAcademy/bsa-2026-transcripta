import { DocumentStatus } from "../enums/enums.js";
import { type DocumentStatusValue } from "../types/types.js";

const DOCUMENT_STATUSES_TO_EXPORT = new Set<DocumentStatusValue>([
	DocumentStatus.BUDGET_STOP,
	DocumentStatus.DONE,
	DocumentStatus.FAILED,
	DocumentStatus.PAUSED,
	DocumentStatus.PROCESSING,
]);

export { DOCUMENT_STATUSES_TO_EXPORT };
