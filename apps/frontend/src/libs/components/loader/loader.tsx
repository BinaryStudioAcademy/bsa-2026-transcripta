import styles from "./loader.module.css";

type Properties = {
	/** Screen-reader text next to the spinner. Not shown visually. */
	label?: string;
	/** Spinner size. */
	size?: "large" | "medium" | "small";
};

/**
 * CSS spinner with a continuous rotation. Accessible via role="status"
 * plus a visually hidden label.
 *
 * @example <Loader label="Loading transcripts" size="small" />
 */

const Loader: React.FC<Properties> = ({
	label = "Loading",
	size = "medium",
}: Properties) => (
	<span className={styles["wrapper"]} role="status">
		<span
			className={[styles["spinner"], styles[size]].filter(Boolean).join(" ")}
		/>
		<span className="visually-hidden">{label}</span>
	</span>
);

export { Loader };
