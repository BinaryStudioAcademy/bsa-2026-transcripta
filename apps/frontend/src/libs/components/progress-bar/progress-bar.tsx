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
		<div
			aria-valuemax={100}
			aria-valuemin={0}
			aria-valuenow={closedPct}
			className={styles["track"]}
			role="progressbar"
		>
			<div
				className={styles["fill"]}
				style={{ width: `${String(closedPct)}%` }}
			/>
		</div>
		<span className="tabular-figures">{verifiedPct}%</span>
	</div>
);

export { ProgressBar };
