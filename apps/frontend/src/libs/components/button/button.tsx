import React from "react";

import styles from "./styles.module.css";

type Properties = {
	"aria-expanded"?: boolean;
	"aria-haspopup"?: React.AriaAttributes["aria-haspopup"];
	"aria-label"?: string;
	"aria-selected"?: boolean;
	children?: React.ReactNode;
	className?: string | undefined;
	"data-id"?: string;
	"data-kind"?: string;
	isDanger?: boolean;
	isDisabled?: boolean;
	isFluid?: boolean;
	isPrimary?: boolean;
	isSecondary?: boolean;
	isSmall?: boolean;
	label?: string;
	onClick?: React.MouseEventHandler<HTMLButtonElement>;
	role?: React.AriaRole;
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
	"aria-expanded": ariaExpanded,
	"aria-haspopup": ariaHaspopup,
	"aria-label": ariaLabel,
	"aria-selected": ariaSelected,
	children,
	className,
	"data-id": dataId,
	"data-kind": dataKind,
	isDanger = false,
	isDisabled = false,
	isFluid = false,
	isPrimary = false,
	isSecondary = false,
	isSmall = false,
	label,
	onClick,
	role,
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
			aria-expanded={ariaExpanded}
			aria-haspopup={ariaHaspopup}
			aria-label={ariaLabel}
			aria-selected={ariaSelected}
			className={buttonClassName}
			data-id={dataId}
			data-kind={dataKind}
			disabled={isDisabled}
			onClick={onClick}
			role={role}
			type={type}
		>
			{label}
			{children}
		</button>
	);
};

export { Button };
