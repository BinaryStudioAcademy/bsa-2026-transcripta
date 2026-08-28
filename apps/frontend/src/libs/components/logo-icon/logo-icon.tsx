import styles from "./styles.module.css";

type Properties = {
	size?: "medium" | "small";
};

const LogoIcon: React.FC<Properties> = ({ size = "medium" }: Properties) => {
	const className = [
		styles["logo-icon"],
		size === "medium" ? styles["md"] : styles["sm"],
	].join(" ");

	return (
		<span className={className}>
			<svg viewBox="0 0 48 48">
				<path
					d="M7 12 L41 8.5 L39.5 17 L8.5 19.5 Z"
					fill="var(--on-accent)"
				></path>
				<path
					d="M19.5 15.5 L29 14.5 L26 42 L22.5 42 Z"
					fill="var(--on-accent)"
				></path>
				<circle cx="33.5" cy="38.5" fill="var(--on-accent)" r="3.4"></circle>
			</svg>
		</span>
	);
};

export { LogoIcon };
