import { Button } from "~/libs/components/components.js";

type Properties = {
	attempts: number;
	isLoading: boolean;
	onReRead: () => void;
	reason: string;
};

const FailedStateCard: React.FC<Properties> = ({
	attempts,
	isLoading,
	onReRead,
	reason,
}: Properties) => {
	return (
		<div className="tx-state">
			<h3 className="tx-state-h">Failed after {attempts} attempts</h3>
			<p className="tx-state-reason">{reason}</p>
			<div className="tx-state-actions">
				<Button
					isDisabled={isLoading}
					isSecondary
					label="Re-read"
					onClick={onReRead}
				/>
			</div>
		</div>
	);
};

export { FailedStateCard };
