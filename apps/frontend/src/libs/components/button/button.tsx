import React from "react";

import styles from "./styles.module.css";

type Properties = {
	isDanger?: boolean;
	isDisabled?: boolean;
	isFluid?: boolean;
	isPrimary?: boolean;
	label: string;
	onClick?: React.MouseEventHandler<HTMLButtonElement>;
	type?: "button" | "submit";
};

const getVariantClassName = (
	isDanger: boolean,
	isPrimary: boolean,
): string | undefined => {
	if (isDanger) {
		return styles["button--danger"];
	}

	if (isPrimary) {
		return styles["button--primary"];
	}

	return styles["button--basic"];
};

const Button: React.FC<Properties> = ({
	isDanger = false,
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
		getVariantClassName(isDanger, isPrimary),
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
