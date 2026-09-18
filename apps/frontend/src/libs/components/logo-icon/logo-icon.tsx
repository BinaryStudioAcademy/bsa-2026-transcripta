import { GLYPH, SIZE_CLASS_NAME } from "./libs/constants/constants.js";
import styles from "./styles.module.css";

type Properties = {
	size?: "large" | "medium" | "small";
};

const LogoIcon: React.FC<Properties> = ({ size = "medium" }: Properties) => {
	const sizeClassName = SIZE_CLASS_NAME[size];
	const glyph = size === "large" ? GLYPH.large : GLYPH.small;

	const className = [styles["logo-icon"], styles[sizeClassName]].join(" ");

	return (
		<span className={className}>
			<svg viewBox="0 0 48 48">
				<path d={glyph.crossbar} fill="var(--paper-100)"></path>
				<path d={glyph.stem} fill="var(--paper-100)"></path>
				<circle
					cx={glyph.dot.cx}
					cy={glyph.dot.cy}
					fill="var(--paper-100)"
					r={glyph.dot.r}
				></circle>
			</svg>
		</span>
	);
};

export { LogoIcon };
