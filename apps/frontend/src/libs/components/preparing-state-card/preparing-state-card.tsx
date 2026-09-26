import { Button } from "~/libs/components/components.js";
import { ToggleProcessingLabel } from "~/libs/enums/enums.js";

type Properties = {
	isPaused: boolean;
	isToggleDisabled: boolean;
	onToggleProcessing: () => void;
};

const PreparingStateCard: React.FC<Properties> = ({
	isPaused,
	isToggleDisabled,
	onToggleProcessing,
}: Properties) => {
	return (
		<div className="tx-state">
			<h3 className="tx-state-h">Preparing the next pages</h3>
			<p className="tx-state-reason">
				Everything ready has been verified; the model is still reading.
			</p>
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
