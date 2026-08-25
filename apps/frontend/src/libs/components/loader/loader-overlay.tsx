import styles from "./loader-overlay.module.css";
import { Loader } from "./loader.js";

type Properties = {
	/** Passed to Loader's accessible label. */
	label?: string;
};

/**
 * Full-screen overlay that centers a Loader. Visibility is controlled
 * by the caller: `{dataStatus === DataStatus.PENDING && <LoaderOverlay />}`.
 *
 * @example <LoaderOverlay label="Loading users" />
 */

const LoaderOverlay: React.FC<Properties> = ({
	label = "Loading",
}: Properties) => (
	<div className={styles["overlay"]}>
		<Loader label={label} size="large" />
	</div>
);

export { LoaderOverlay };
