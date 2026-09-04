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
		<span className="tabular-figures">
			{formatMoney(spentUsd)} / {formatMoney(limitUsd)}
		</span>
	);
};

export { BudgetIndicator };
