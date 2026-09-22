import {
	BudgetIndicator,
	Button,
	ProgressBar,
} from "~/libs/components/components.js";
import {
	EMPTY_LENGTH,
	PERCENTAGE_MULTIPLIER,
} from "~/libs/constants/common.constants.js";
import { type ValueOf } from "~/libs/types/types.js";
import { DocumentStatus } from "~/modules/documents/libs/enums/enums.js";

import { DocumentSection } from "../document-section/document-section.js";
import styles from "./styles.module.css";

type Properties = {
	budgetLimitUsd: string;
	budgetSpentUsd: string;
	cursorPageNo: number;
	onRaiseLimitClick: () => void;
	pagesBlank: number;
	pagesFailed: number;
	pagesTotal: number;
	pagesTranscribed: number;
	status: ValueOf<typeof DocumentStatus>;
};

const TranscriptionBlock: React.FC<Properties> = ({
	budgetLimitUsd,
	budgetSpentUsd,
	cursorPageNo,
	onRaiseLimitClick,
	pagesBlank,
	pagesFailed,
	pagesTotal,
	pagesTranscribed,
	status,
}: Properties) => {
	const transcribedPct =
		(pagesTranscribed / pagesTotal) * PERCENTAGE_MULTIPLIER;

	return (
		<DocumentSection
			count={
				<>
					{pagesTranscribed} of {pagesTotal} pages transcribed
				</>
			}
			title="Transcription"
		>
			<ProgressBar percent={transcribedPct} />
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
			<div className={styles["stats-row"]}>
				{pagesBlank > EMPTY_LENGTH && (
					<span>{pagesBlank} blank pages never sent to the model</span>
				)}
				{pagesFailed > EMPTY_LENGTH && (
					<span className={styles["stats-row__failed"]}>
						{pagesFailed} failed
					</span>
				)}
			</div>
		</DocumentSection>
	);
};

export { TranscriptionBlock };
