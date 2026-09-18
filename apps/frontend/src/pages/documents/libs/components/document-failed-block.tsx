import { Button } from "~/libs/components/components.js";

type Properties = {
	errorMessage: null | string;
	onRetry: () => void;
};

const DocumentFailedBlock: React.FC<Properties> = ({
	errorMessage,
	onRetry,
}) => {
	return (
		<div>
			{errorMessage && <p>{errorMessage}</p>}
			<Button isPrimary label="Try again" onClick={onRetry} />
		</div>
	);
};

export { DocumentFailedBlock };
