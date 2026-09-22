type Properties = {
	percent: number;
};

const ProgressBar: React.FC<Properties> = ({ percent }: Properties) => (
	<div
		aria-valuemax={100}
		aria-valuemin={0}
		aria-valuenow={percent}
		className="tx-progress-track"
		role="progressbar"
	>
		<div
			className="tx-progress-fill"
			style={{ width: `${String(percent)}%` }}
		/>
	</div>
);

export { ProgressBar };
