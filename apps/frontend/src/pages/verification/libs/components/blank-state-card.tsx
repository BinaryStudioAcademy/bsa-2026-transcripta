import { Button } from "~/libs/components/components.js";

type Properties = {
	isLoading: boolean;
	onReprocess: () => void;
};

const BlankStateCard: React.FC<Properties> = ({
	isLoading,
	onReprocess,
}: Properties) => {
	return (
		<div className="tx-state">
			<h3 className="tx-state-h">This page is blank</h3>
			<p className="tx-state-reason">It wasn’t sent to the model</p>
			<div className="tx-state-actions">
				<Button
					isDisabled={isLoading}
					label="Reprocess"
					onClick={onReprocess}
					type="button"
				/>
			</div>
		</div>
	);
};

export { BlankStateCard };
