import { AppRoute } from "~/libs/enums/app-route.enum.js";
import { Link } from "../link/link.js";
import { configureString } from "~/libs/helpers/helpers.js";
import styles from "./ground-truth-block.module.css";

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
				{pagesTyped} of {pagesTotal} pages typed blind
			</span>
			<p>
				CER <span className={styles["percent"]}>{cer}%</span> — measured against
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
