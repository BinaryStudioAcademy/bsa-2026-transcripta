import {
	BudgetIndicator,
	Button,
	ProgressBar,
} from "~/libs/components/components.js";
import { type ValueOf } from "~/libs/types/types.js";
import { DocumentStatus } from "~/modules/documents/libs/enums/enums.js";

import { DocumentSection } from "../document-section/document-section.js";
import styles from "./styles.module.css";

type Properties = {
	budgetLimitUsd: string;
	budgetSpentUsd: string;
	closedPct: number;
	cursorPageNo: number;
	onRaiseLimitClick: () => void;
	pagesTotal: number;
	pagesTranscribed: number;
	status: ValueOf<typeof DocumentStatus>;
};

const TranscriptionBlock: React.FC<Properties> = ({
	budgetLimitUsd,
	budgetSpentUsd,
	closedPct,
	cursorPageNo,
	onRaiseLimitClick,
	pagesTotal,
	pagesTranscribed,
	status,
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
			{status === DocumentStatus.BUDGET_STOP && (
				<>
					<span>
						{" "}
						Stopped before page <span>{cursorPageNo}</span>
					</span>
					<Button
						isSecondary
						isSmall
						label="Raise the limit"
						onClick={onRaiseLimitClick}
					/>
				</>
			)}
		</div>
	</DocumentSection>
);

export { TranscriptionBlock };
