import { Button } from "~/libs/components/components.js";

type Properties = {
	isPauseDisabled: boolean;
	message?: string;
	onPause: () => void;
};

const PreparingStateCard: React.FC<Properties> = ({
	isPauseDisabled,
	message,
	onPause,
}: Properties) => {
	return (
		<div className="tx-state">
			<h3 className="tx-state-h">Preparing pages</h3>
			<p className="tx-state-reason">{message}</p>
			<div className="tx-state-actions">
				<Button
					isDisabled={isPauseDisabled}
					isSecondary
					label="Pause"
					onClick={onPause}
				/>
			</div>
		</div>
	);
};

export { PreparingStateCard };
