import { LoaderSize } from "~/libs/enums/enums.js";

import styles from "./loader-overlay.module.css";
import { Loader } from "./loader.js";

type Properties = {
	label?: string;
};

const LoaderOverlay: React.FC<Properties> = ({
	label = "Loading",
}: Properties) => (
	<div className={styles["overlay"]}>
		<Loader label={label} size={LoaderSize.LARGE} />
	</div>
);

export { /** @public */ LoaderOverlay };
