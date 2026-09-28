import { Button } from "~/libs/components/components.js";

type Properties = {
	attempts: number;
	isLoading: boolean;
	onReRead: () => void;
	onTypeByHand: () => void;
	reason: string;
};

const FailedStateCard: React.FC<Properties> = ({
	attempts,
	isLoading,
	onReRead,
	onTypeByHand,
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
					type="button"
				/>
				<Button
					isDisabled={isLoading}
					label="Type it by hand"
					onClick={onTypeByHand}
					type="button"
				/>
			</div>
		</div>
	);
};

export { FailedStateCard };
