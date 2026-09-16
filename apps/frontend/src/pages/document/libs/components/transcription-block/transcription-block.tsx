import { BudgetIndicator, ProgressBar } from "~/libs/components/components.js";

import { DocumentSection } from "../document-section/document-section.js";
import styles from "./styles.module.css";

type Properties = {
	budgetLimitUsd: string;
	budgetSpentUsd: string;
	closedPct: number;
	pagesTotal: number;
	pagesTranscribed: number;
};

const TranscriptionBlock: React.FC<Properties> = ({
	budgetLimitUsd,
	budgetSpentUsd,
	closedPct,
	pagesTotal,
	pagesTranscribed,
}: Properties) => (
	<DocumentSection
		count={
			<>
				{pagesTranscribed} of {pagesTotal} pages transcribed
			</>
		}
		title="Transcription"
	>
		<ProgressBar closedPct={closedPct} />
		<div className={styles["budget-row"]}>
			<BudgetIndicator limitUsd={budgetLimitUsd} spentUsd={budgetSpentUsd} />
		</div>
	</DocumentSection>
);

export { TranscriptionBlock };
