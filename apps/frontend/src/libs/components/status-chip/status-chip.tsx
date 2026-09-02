import { DocumentStatus } from "@transcripta/shared";

import { type ValueOf } from "~/libs/types/types.js";

import { STATUS_LABEL } from "./libs/constants/constants.js";

type Properties = {
	status: ValueOf<typeof DocumentStatus>;
};

const StatusChip: React.FC<Properties> = ({ status }: Properties) => (
	<span>{STATUS_LABEL[status]}</span>
);

export { StatusChip };
