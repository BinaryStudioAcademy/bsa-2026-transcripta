import React from "react";

import styles from "./styles.module.css";

type Properties = {
	isDisabled?: boolean;
	isFluid?: boolean;
	isPrimary?: boolean;
	label: string;
	onClick?: React.MouseEventHandler<HTMLButtonElement>;
	type?: "button" | "submit";
};

const Button: React.FC<Properties> = ({
	isDisabled = false,
	isFluid = false,
	isPrimary = false,
	label,
	onClick,
	type = "button",
}: Properties) => {
	const buttonClassName = [
		styles["button"],
		isFluid && styles["button--fluid"],
		isPrimary ? styles["button--primary"] : styles["button--basic"],
		isDisabled && styles["button--disabled"],
	]
		.filter(Boolean)
		.join(" ");

	return (
		<button
			className={buttonClassName}
			disabled={isDisabled}
			onClick={onClick}
			type={type}
		>
			{label}
		</button>
	);
};

export { Button };
