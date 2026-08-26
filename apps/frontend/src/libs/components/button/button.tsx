import styles from "./styles.module.css";

type Properties = {
	label: string;
	type?: "button" | "submit";
};

const Button: React.FC<Properties> = ({
	label,
	type = "button",
}: Properties) => (
	<button className={styles["button"]} type={type}>
		{label}
	</button>
);

export { Button };
