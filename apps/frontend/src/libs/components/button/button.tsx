import React from "react";

import styles from "./styles.module.css";

type Properties = {
	className?: string | undefined;
	isDanger?: boolean;
	isDisabled?: boolean;
	isFluid?: boolean;
	isPrimary?: boolean;
	isSecondary?: boolean;
	isSmall?: boolean;
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
	className,
	isDanger = false,
	isDisabled = false,
	isFluid = false,
	isPrimary = false,
	isSecondary = false,
	isSmall = false,
	label,
	onClick,
	type = "button",
}: Properties) => {
	const buttonClassName = [
		styles["button"],
		isFluid && styles["button--fluid"],
		getVariantClassName(isDanger, isPrimary),
		isDisabled && styles["button--disabled"],
		isSecondary ? styles["button--secondary"] : styles["button--basic"],
		isSmall && styles["button--sm"],
		className,
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
