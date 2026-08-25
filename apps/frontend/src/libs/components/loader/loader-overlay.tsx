import { LoaderSize } from "~/libs/enums/enums.js";

import styles from "./loader-overlay.module.css";
import { Loader } from "./loader.js";

type Properties = {
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
		<Loader label={label} size={LoaderSize.LARGE} />
	</div>
);

export { LoaderOverlay };
