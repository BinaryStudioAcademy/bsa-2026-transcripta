import { DocumentStatus } from "@transcripta/shared";

import { type ValueOf } from "~/libs/types/types.js";

const TERMINAL_DOCUMENT_STATUSES: ReadonlySet<ValueOf<typeof DocumentStatus>> =
	new Set([
		DocumentStatus.BUDGET_STOP,
		DocumentStatus.DONE,
		DocumentStatus.FAILED,
		DocumentStatus.PAUSED,
	]);

export { TERMINAL_DOCUMENT_STATUSES };
