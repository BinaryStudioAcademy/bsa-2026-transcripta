import styles from "./progress-bar.module.css";

type Properties = {
	closedPct: number;
	verifiedPct: number;
};

const ProgressBar: React.FC<Properties> = ({
	closedPct,
	verifiedPct,
}: Properties) => (
	<div>
		<div className={styles["track"]}>
			<div className={styles["fill"]} style={{ width: `${closedPct}%` }} />
		</div>
		<span className={styles["figure"]}>{verifiedPct}%</span>
	</div>
);

export { ProgressBar };
