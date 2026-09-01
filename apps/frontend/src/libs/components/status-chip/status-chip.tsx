import { type ValueOf } from "~/libs/types/types.js";
import { DocumentStatus } from "~/modules/documents/documents.js";

type Properties = {
	status: ValueOf<typeof DocumentStatus>;
};

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

const StatusChip: React.FC<Properties> = ({ status }: Properties) => (
	<span>{STATUS_LABEL[status]}</span>
);

export { StatusChip };
