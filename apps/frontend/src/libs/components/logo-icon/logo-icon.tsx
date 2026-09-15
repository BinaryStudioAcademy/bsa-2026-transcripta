import { GLYPH, SIZE_CLASS_NAME } from "./libs/constants/constants.js";
import styles from "./styles.module.css";

type Properties = {
	size?: "large" | "medium" | "small";
	variant?: "badge" | "mark";
};

const LogoIcon: React.FC<Properties> = ({
	size = "medium",
	variant = "badge",
}: Properties) => {
	const sizeClassName = SIZE_CLASS_NAME[size];
	const glyph = size === "large" ? GLYPH.large : GLYPH.small;

	const className = [
		styles["logo-icon"],
		styles[variant],
		styles[sizeClassName],
	].join(" ");

	const glyphFill = variant === "badge" ? "var(--paper-100)" : "var(--text)";
	const dotFill = variant === "badge" ? "var(--paper-100)" : "var(--accent)";

	return (
		<span className={className}>
			<svg viewBox="0 0 48 48">
				<path d={glyph.crossbar} fill={glyphFill}></path>
				<path d={glyph.stem} fill={glyphFill}></path>
				<circle
					cx={glyph.dot.cx}
					cy={glyph.dot.cy}
					fill={dotFill}
					r={glyph.dot.r}
				></circle>
			</svg>
		</span>
	);
};

export { LogoIcon };
