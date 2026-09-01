import { formatMoney } from "~/libs/helpers/helpers.js";

import styles from "./budget-indicator.module.css";

type Properties = {
	limitUsd: string;
	spentUsd: string;
};

const BudgetIndicator: React.FC<Properties> = ({
	limitUsd,
	spentUsd,
}: Properties) => {
	return (
		<span className={styles["money"]}>
			{formatMoney(spentUsd)} / {formatMoney(limitUsd)}
		</span>
	);
};

export { BudgetIndicator };
