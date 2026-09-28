import { Button } from "~/libs/components/components.js";
import { ToggleProcessingLabel } from "~/libs/enums/enums.js";

type Properties = {
	isPaused: boolean;
	isToggleDisabled: boolean;
	message?: string;
	onToggleProcessing: () => void;
};

const PreparingStateCard: React.FC<Properties> = ({
	isPaused,
	isToggleDisabled,
	message,
	onToggleProcessing,
}: Properties) => {
	return (
		<div className="tx-state">
			<h3 className="tx-state-h">Preparing pages</h3>
			<p className="tx-state-reason">{message}</p>
			<div className="tx-state-actions">
				<Button
					isDisabled={isToggleDisabled}
					isPrimary={isPaused}
					isSecondary={!isPaused}
					label={
						isPaused
							? ToggleProcessingLabel.RESUME
							: ToggleProcessingLabel.PAUSE
					}
					onClick={onToggleProcessing}
				/>
			</div>
		</div>
	);
};

export { PreparingStateCard };
