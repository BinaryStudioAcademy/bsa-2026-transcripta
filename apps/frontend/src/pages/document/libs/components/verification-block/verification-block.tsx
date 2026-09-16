import { Link } from "~/libs/components/components.js";
import { INITIAL_COUNT } from "~/libs/constants/constants.js";
import { AppRoute } from "~/libs/enums/enums.js";
import { configureString } from "~/libs/helpers/helpers.js";
import { useEffect, useNavigate } from "~/libs/hooks/hooks.js";

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
}: Properties) => {
	const navigate = useNavigate();
	const resumeRoute = configureString(AppRoute.VERIFICATION, {
		id: String(documentId),
	});

	useEffect(() => {
		const handleKeyDown = (event: KeyboardEvent): void => {
			if (event.key !== "Enter") {
				return;
			}

			const { target } = event;
			const isInteractiveTarget =
				target instanceof HTMLElement &&
				(target.tagName === "INPUT" ||
					target.tagName === "TEXTAREA" ||
					target.tagName === "BUTTON" ||
					target.tagName === "A" ||
					target.isContentEditable);
			const isDialogOpen = document.querySelector("[aria-modal='true']");

			if (isInteractiveTarget || isDialogOpen) {
				return;
			}

			// eslint-disable-next-line sonarjs/void-use -- navigate() can return a promise here; no-floating-promises requires marking it void
			void navigate(resumeRoute);
		};

		document.addEventListener("keydown", handleKeyDown);

		return () => {
			document.removeEventListener("keydown", handleKeyDown);
		};
	}, [navigate, resumeRoute]);

	return (
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
				<Link className={styles["resume-link"]} to={resumeRoute}>
					Resume at page {cursorPageNo}
				</Link>
				<span className="tx-kbdrow">
					<kbd className="tx-kbd">Enter</kbd>
					Resume
				</span>
			</div>
		</DocumentSection>
	);
};

export { VerificationBlock };
