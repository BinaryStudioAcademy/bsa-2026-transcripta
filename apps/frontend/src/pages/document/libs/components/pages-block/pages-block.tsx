import {
	EMPTY_LENGTH,
	PERCENTAGE_MULTIPLIER,
} from "~/libs/constants/common.constants.js";

import { DocumentSection } from "../document-section/document-section.js";
import styles from "./styles.module.css";

type Properties = {
	cursorPageNo: number;
	pagesBlank: number;
	pagesFailed: number;
	pagesInWork: number;
	pagesPending: number;
	pagesReadyToCheck: number;
	pagesSkipped: number;
	pagesTotal: number;
	pagesTranscribed: number;
	pagesVerified: number;
};

const PagesBlock: React.FC<Properties> = ({
	cursorPageNo,
	pagesBlank,
	pagesFailed,
	pagesInWork,
	pagesPending,
	pagesReadyToCheck,
	pagesSkipped,
	pagesTotal,
	pagesTranscribed,
	pagesVerified,
}: Properties) => {
	const closedCount = pagesVerified + pagesSkipped + pagesBlank + pagesFailed;

	const segments = [
		{
			caption: `${String(pagesVerified)} verified`,
			className: styles["segment--verified"],
			count: pagesVerified,
			label: `${String(pagesVerified)} verified — confirmed or corrected by you.`,
		},
		{
			caption: `${String(pagesReadyToCheck)} ready to check`,
			className: styles["segment--ready"],
			count: pagesReadyToCheck,
			label: `${String(pagesReadyToCheck)} ready to check — transcribed, waiting on you.`,
		},
		{
			caption: `${String(pagesInWork)} at the model now`,
			className: styles["segment--in-work"],
			count: pagesInWork,
			label: `${String(pagesInWork)} at the model right now.`,
		},
		{
			caption: `${String(pagesPending)} pending`,
			className: styles["segment--pending"],
			count: pagesPending,
			label: `${String(pagesPending)} pending — split out of the PDF, not queued yet. They are queued as you work, so their context is as fresh as possible.`,
		},
		{
			caption: `${String(pagesSkipped)} skipped`,
			className: styles["segment--skipped"],
			count: pagesSkipped,
			label: `${String(pagesSkipped)} skipped — left closed, out of the context.`,
		},
		{
			caption: `${String(pagesBlank)} blank`,
			className: styles["segment--blank"],
			count: pagesBlank,
			label: `${String(pagesBlank)} blank — never sent to the model.`,
		},
		{
			caption: `${String(pagesFailed)} failed`,
			className: styles["segment--failed"],
			count: pagesFailed,
			label: `${String(pagesFailed)} failed — hit the retry cap, needs a requeue.`,
		},
	];

	return (
		<DocumentSection
			count={`${String(closedCount)} of ${String(pagesTotal)} closed`}
			title="Pages"
		>
			<div
				aria-label="Page status breakdown"
				className={styles["bar"]}
				role="img"
			>
				{segments.map(
					(segment) =>
						segment.count > EMPTY_LENGTH && (
							<div
								className={[styles["segment"], segment.className, "tx-tip"]
									.filter(Boolean)
									.join(" ")}
								data-tip={segment.caption}
								key={segment.className}
								style={{
									flexBasis: `${String((segment.count / pagesTotal) * PERCENTAGE_MULTIPLIER)}%`,
								}}
							/>
						),
				)}
			</div>

			<div className={styles["cursors"]}>
				<span>
					you: page <span className="tx-num">{cursorPageNo}</span>
				</span>
				<span>
					model: page <span className="tx-num">{pagesTranscribed}</span>
				</span>
			</div>

			<ul className={styles["legend"]}>
				{segments.map(
					(segment) =>
						segment.count > EMPTY_LENGTH && (
							<li className={styles["legend-item"]} key={segment.className}>
								<span
									className={[styles["legend-swatch"], segment.className]
										.filter(Boolean)
										.join(" ")}
								/>
								{segment.label}
							</li>
						),
				)}
			</ul>
		</DocumentSection>
	);
};

export { PagesBlock };
