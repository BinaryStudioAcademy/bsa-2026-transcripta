import { Button } from "~/libs/components/components.js";

import styles from "./styles.module.css";

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
			{errorMessage && (
				<div className={styles["error-box"]}>{errorMessage}</div>
			)}
			<Button isPrimary label="Try again" onClick={onRetry} />
		</div>
	);
};

export { DocumentFailedBlock };
