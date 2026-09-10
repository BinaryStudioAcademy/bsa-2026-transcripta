import { DocumentStatus } from "@transcripta/shared";

import { type ValueOf } from "~/libs/types/types.js";

import { type StatusChipVariant } from "../types/types.js";

const STATUS_CHIP_VARIANT: Record<
	ValueOf<typeof DocumentStatus>,
	StatusChipVariant
> = {
	[DocumentStatus.BUDGET_STOP]: { icon: "!", modifier: "warn" },
	[DocumentStatus.DONE]: { icon: "✓", modifier: "ok" },
	[DocumentStatus.DRAFT]: { icon: null, modifier: null },
	[DocumentStatus.FAILED]: { icon: "!", modifier: "danger" },
	[DocumentStatus.INGESTING]: { icon: null, modifier: null },
	[DocumentStatus.PAUSED]: { icon: null, modifier: null },
	[DocumentStatus.PROCESSING]: { icon: "░", modifier: null },
	[DocumentStatus.READY]: { icon: null, modifier: null },
};

export { STATUS_CHIP_VARIANT };
