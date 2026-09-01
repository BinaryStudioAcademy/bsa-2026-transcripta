import {
	BudgetIndicator,
	GroundTruthBlock,
	Link,
	LoaderOverlay,
	ProgressBar,
	StatusChip,
} from "~/libs/components/components.js";
import { AppRoute, DataStatus } from "~/libs/enums/enums.js";
import { configureString } from "~/libs/helpers/helpers.js";
import {
	useAppDispatch,
	useAppSelector,
	useEffect,
	useParams,
} from "~/libs/hooks/hooks.js";
import { actions as documentActions } from "~/modules/documents/documents.js";

import styles from "./document.module.css";

const Document: React.FC = () => {
	const dispatch = useAppDispatch();
	const { document, documentDataStatus } = useAppSelector(({ documents }) => ({
		document: documents.document,
		documentDataStatus: documents.documentDataStatus,
	}));

	const { id } = useParams();

	useEffect(() => {
		void dispatch(documentActions.loadById(Number(id)));
	}, [id, dispatch]);

	const isLoading = documentDataStatus === DataStatus.PENDING;
	const hasError = documentDataStatus === DataStatus.REJECTED;

	return (
		<>
			{isLoading && <LoaderOverlay label="Loading document" />}
			{hasError && <p>Unable to download the document.</p>}
			{document && (
				<>
					<h1>{document.title}</h1>
					<StatusChip status={document.status} />

					<section>
						<h2>Transcription</h2>
						<ProgressBar
							closedPct={document.progress.closedPct}
							verifiedPct={document.progress.verifiedPct}
						/>
						<BudgetIndicator
							limitUsd={document.budget.limitUsd}
							spentUsd={document.budget.spentUsd}
						/>
					</section>

					<section>
						<h2>Verification</h2>
						<Link
							to={configureString(AppRoute.VERIFICATION, {
								id: String(document.id),
							})}
						>
							Resume at page{" "}
							<span className={styles["figure"]}>{document.cursorPageNo}</span>
						</Link>
					</section>

					{document.groundTruth && (
						<section>
							<h2>Ground truth</h2>
							<GroundTruthBlock
								cer={document.groundTruth.cer}
								documentId={document.id}
								pagesTotal={document.groundTruth.pagesTotal}
								pagesTyped={document.groundTruth.pagesTyped}
							/>
						</section>
					)}
				</>
			)}
		</>
	);
};

export { Document };
