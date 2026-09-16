import { Link } from "~/libs/components/components.js";
import { INITIAL_COUNT } from "~/libs/constants/constants.js";
import { AppRoute } from "~/libs/enums/enums.js";
import { configureString } from "~/libs/helpers/helpers.js";

import { DocumentSection } from "../document-section/document-section.js";
import styles from "./styles.module.css";

type Properties = {
	cursorPageNo: number;
	documentId: number;
	pagesInWork: number;
	pagesTotal: number;
	pagesTranscribed: number;
	pagesVerified: number;
};

const VerificationBlock: React.FC<Properties> = ({
	cursorPageNo,
	documentId,
	pagesInWork,
	pagesTotal,
	pagesTranscribed,
	pagesVerified,
}: Properties) => (
	<DocumentSection
		count={
			<>
				{pagesVerified} of {pagesTranscribed} reviewed
			</>
		}
		title="Verification"
	>
		<div className={styles["body"]}>
			<span className="tx-num">{pagesVerified}</span> of{" "}
			<span className="tx-num">{pagesTotal}</span> pages verified
			{pagesInWork > INITIAL_COUNT && (
				<span>
					{" "}
					· <span className="tx-num">{pagesInWork}</span> in work
				</span>
			)}
		</div>
		<div className={styles["resume-row"]}>
			<Link
				className={styles["resume-link"]}
				to={configureString(AppRoute.VERIFICATION, {
					id: String(documentId),
				})}
			>
				Resume at page <span className="tx-num">{cursorPageNo}</span>
			</Link>
		</div>
	</DocumentSection>
);

export { VerificationBlock };
