import { DocumentStatus } from "@transcripta/shared";

import { type DocumentStatusValue } from "../types/types.js";

const NON_DELETABLE_DOCUMENT_STATUSES: ReadonlySet<DocumentStatusValue> =
	new Set([DocumentStatus.INGESTING, DocumentStatus.PROCESSING]);

export { NON_DELETABLE_DOCUMENT_STATUSES };
