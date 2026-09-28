import { EMPTY_LENGTH } from "@transcripta/shared";

import {
	CELL_STAGGER_MS,
	MAX_GRID_CELLS,
	PLACEHOLDER_GRID_CELLS,
} from "../../libs/constants/constants.js";
import styles from "./styles.module.css";

type Properties = {
	onOpenDocument: () => void;
	pagesReady: number;
	pagesTotal: number;
	title: string;
};

const IngestProgress: React.FC<Properties> = ({
	onOpenDocument,
	pagesReady,
	pagesTotal,
	title,
}: Properties) => {
	const isSplitting = pagesTotal === EMPTY_LENGTH;
	const cellCount = isSplitting
		? PLACEHOLDER_GRID_CELLS
		: Math.min(pagesTotal, MAX_GRID_CELLS);
	const filledCells = isSplitting
		? EMPTY_LENGTH
		: Math.ceil((pagesReady / pagesTotal) * cellCount);

	return (
		<section className={styles["card"]}>
			<h3 className={styles["title"]}>
				{isSplitting
					? "Splitting the PDF into pages"
					: "Reading the first page"}
			</h3>

			<p className={styles["note"]}>
				{isSplitting
					? `${title} is being cut into pages, one at a time.`
					: "Verification opens by itself as soon as the first page is read."}
			</p>

			<div className={styles["grid"]}>
				{Array.from({ length: cellCount }, (_, index) => (
					<i
						className={[
							styles["cell"],
							index < filledCells ? styles["cell--on"] : "",
							isSplitting ? styles["cell--pulse"] : "",
						]
							.filter(Boolean)
							.join(" ")}
						key={index}
						style={
							isSplitting
								? { animationDelay: `${String(index * CELL_STAGGER_MS)}ms` }
								: {}
						}
					/>
				))}
			</div>

			<p className={styles["count"]}>
				{isSplitting
					? "counting pages…"
					: `${String(pagesReady)} / ${String(pagesTotal)} pages ready`}
			</p>

			<button
				className={styles["escape"]}
				onClick={onOpenDocument}
				type="button"
			>
				Open the document page instead
			</button>
		</section>
	);
};

export { IngestProgress };
