import { DocumentStatus } from "@transcripta/shared";

import { type ValueOf } from "~/libs/types/types.js";

const STATUS_LABEL: Record<ValueOf<typeof DocumentStatus>, string> = {
	[DocumentStatus.BUDGET_STOP]: "Budget limit",
	[DocumentStatus.DONE]: "Done",
	[DocumentStatus.DRAFT]: "Draft",
	[DocumentStatus.FAILED]: "Failed",
	[DocumentStatus.INGESTING]: "Ingesting",
	[DocumentStatus.PAUSED]: "Paused",
	[DocumentStatus.PROCESSING]: "Processing",
	[DocumentStatus.READY]: "Ready",
};

export { STATUS_LABEL };
