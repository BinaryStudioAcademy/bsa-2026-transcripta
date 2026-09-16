import { Link } from "~/libs/components/components.js";
import { AppRoute } from "~/libs/enums/enums.js";
import { configureString } from "~/libs/helpers/helpers.js";

import { DocumentSection } from "../document-section/document-section.js";
import styles from "./styles.module.css";

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
}: Properties) => (
	<DocumentSection
		count={
			<>
				{pagesTyped} of {pagesTotal} pages typed blind
			</>
		}
		isMuted
		title="Ground truth"
	>
		<p className={styles["cer"]}>
			CER <span className="tx-num">{cer}%</span> — measured against your
			blind-typed pages.
		</p>
		<Link
			className={styles["link"]}
			to={configureString(AppRoute.GROUND_TRUTH, { id: String(documentId) })}
		>
			Type more pages
		</Link>
	</DocumentSection>
);

export { GroundTruthBlock };
