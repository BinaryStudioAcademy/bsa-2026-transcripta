import { Link } from "~/libs/components/components.js";
import { AppRoute } from "~/libs/enums/enums.js";
import { configureString } from "~/libs/helpers/helpers.js";
import { useEffect, useNavigate } from "~/libs/hooks/hooks.js";

import { DocumentSection } from "../document-section/document-section.js";
import styles from "./styles.module.css";
import { ONE_QUANTITY } from "~/libs/constants/common.constants.js";

type Properties = {
	cursorPageNo: number;
	documentId: number;
	pagesReadyToCheck: number;
	pagesSkipped: number;
	pagesTranscribed: number;
	pagesVerified: number;
};

const VerificationBlock: React.FC<Properties> = ({
	cursorPageNo,
	documentId,
	pagesReadyToCheck,
	pagesSkipped,
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

			Promise.resolve(navigate(resumeRoute)).catch(() => null);
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
					{pagesVerified + pagesSkipped} of {pagesTranscribed} reviewed
				</>
			}
			title="Verification"
		>
			<div className={styles["body"]}>
				Your cursor is saved at page{" "}
				<span className="tx-num">{cursorPageNo}</span>. So far:{" "}
				<span className="tx-num">{pagesVerified}</span> verified,{" "}
				<span className="tx-num">{pagesSkipped}</span> skipped.{" "}
				<span className="tx-num">{pagesReadyToCheck}</span>{" "}
				{pagesReadyToCheck === ONE_QUANTITY ? "page" : "pages"} ready to check.
			</div>
			<div className={styles["resume-row"]}>
				<Link className={styles["resume-link"] ?? ""} to={resumeRoute}>
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
