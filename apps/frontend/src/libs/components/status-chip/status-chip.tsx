import { DocumentStatus } from "@transcripta/shared";

import { type ValueOf } from "~/libs/types/types.js";

import {
	STATUS_CHIP_VARIANT,
	STATUS_LABEL,
} from "./libs/constants/constants.js";

type Properties = {
	status: ValueOf<typeof DocumentStatus>;
};

const StatusChip: React.FC<Properties> = ({ status }: Properties) => {
	const { icon, modifier } = STATUS_CHIP_VARIANT[status];

	const chipClassName = ["tx-chip", modifier && `tx-chip--${modifier}`]
		.filter(Boolean)
		.join(" ");

	return (
		<span className={chipClassName}>
			{icon && <span className="tx-chip__icon">{icon}</span>}
			{STATUS_LABEL[status]}
		</span>
	);
};

export { StatusChip };
