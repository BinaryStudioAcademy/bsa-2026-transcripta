type Properties = {
	closedPct: number;
};

const ProgressBar: React.FC<Properties> = ({ closedPct }: Properties) => (
	<div
		aria-valuemax={100}
		aria-valuemin={0}
		aria-valuenow={closedPct}
		className="tx-progress-track"
		role="progressbar"
	>
		<div
			className="tx-progress-fill"
			style={{ width: `${String(closedPct)}%` }}
		/>
	</div>
);

export { ProgressBar };
