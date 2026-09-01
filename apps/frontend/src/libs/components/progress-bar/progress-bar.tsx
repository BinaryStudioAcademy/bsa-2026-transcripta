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
		<div>
			<div
				style={{
					background: "#b23a2f",
					height: "100%",
					width: `${closedPct}%`,
				}}
			/>
		</div>
		<span className={styles["percent"]}>{verifiedPct}%</span>
	</div>
);

export { ProgressBar };
