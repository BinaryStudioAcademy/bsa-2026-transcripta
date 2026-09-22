import { formatMoney } from "~/libs/helpers/helpers.js";

type Properties = {
	limitUsd: string;
	spentUsd: string;
	usedPct?: number;
};

const BudgetIndicator: React.FC<Properties> = ({
	limitUsd,
	spentUsd,
	usedPct,
}: Properties) => {
	return (
		<span className="tx-num">
			{formatMoney(spentUsd)} / {formatMoney(limitUsd)}
			{typeof usedPct === "number" && ` (${String(usedPct)}%)`}
		</span>
	);
};

export { BudgetIndicator };
