import { Button } from "~/libs/components/components.js";

type Properties = {
	isPauseDisabled: boolean;
	onPause: () => void;
};

const PreparingStateCard: React.FC<Properties> = ({
	isPauseDisabled,
	onPause,
}: Properties) => {
	return (
		<div className="tx-state">
			<h3 className="tx-state-h">Preparing the next pages</h3>
			<p className="tx-state-reason">
				Everything ready has been verified; the model is still reading.
			</p>
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
