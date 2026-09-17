import { Button } from "~/libs/components/components.js";

type Properties = {
	attempts: number;
	reason: string;
	isLoading: boolean;
	onReRead: () => void;
};

const FailedStateCard: React.FC<Properties> = ({
	attempts,
	reason,
	isLoading,
	onReRead,
}: Properties) => {
	return (
		<div className="tx-state">
			<h3 className="tx-state-h">Failed after {attempts} attempts</h3>
			<p className="tx-state-reason">{reason}</p>
			<div className="tx-state-actions">
				<Button
					isSecondary
					label="Re-read"
					onClick={onReRead}
					isDisabled={isLoading}
				/>
			</div>
		</div>
	);
};

export { FailedStateCard };
