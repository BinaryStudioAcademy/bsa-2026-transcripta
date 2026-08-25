import { type ValueOf } from "@transcripta/shared";

import { LoaderSize } from "~/libs/enums/enums.js";

import styles from "./loader.module.css";

type Properties = {
	label?: string;
	size?: ValueOf<typeof LoaderSize>;
};

/**
 * CSS spinner with a continuous rotation. Accessible via role="status"
 * plus a visually hidden label.
 *
 * @example <Loader label="Loading transcripts" size={LoaderSize.SMALL} />
 */

const Loader: React.FC<Properties> = ({
	label = "Loading",
	size = LoaderSize.MEDIUM,
}: Properties) => (
	<span className={styles["wrapper"]} role="status">
		<span
			className={[styles["spinner"], styles[size]].filter(Boolean).join(" ")}
		/>
		<span className="visually-hidden">{label}</span>
	</span>
);

export { Loader };
