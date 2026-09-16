import { formatMoney } from "~/libs/helpers/helpers.js";

type Properties = {
	limitUsd: string;
	spentUsd: string;
};

const BudgetIndicator: React.FC<Properties> = ({
	limitUsd,
	spentUsd,
}: Properties) => {
	return (
		<span className="tx-num">
			{formatMoney(spentUsd)} / {formatMoney(limitUsd)}
			{" spent"}
		</span>
	);
};

export { BudgetIndicator };
