import { Link } from "~/libs/components/components.js";
import { AppRoute } from "~/libs/enums/enums.js";
import { configureString } from "~/libs/helpers/helpers.js";

type Properties = {
	cer: number;
	documentId: number;
	pagesTotal: number;
	pagesTyped: number;
};

const GroundTruthBlock: React.FC<Properties> = ({
	cer,
	documentId,
	pagesTotal,
	pagesTyped,
}: Properties) => {
	return (
		<>
			<span>
				<span className="tabular-figures">{pagesTyped}</span> of{" "}
				<span className="tabular-figures">{pagesTotal}</span> pages typed blind
			</span>
			<p>
				CER <span className="tabular-figures">{cer}%</span> — measured against
				your blind-typed pages.
			</p>
			<Link
				to={configureString(AppRoute.GROUND_TRUTH, { id: String(documentId) })}
			>
				Type more pages
			</Link>
		</>
	);
};

export { GroundTruthBlock };
