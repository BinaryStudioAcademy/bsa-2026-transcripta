import React, { useState } from "react";
import {
	type Control,
	type FieldErrors,
	type FieldPath,
	type FieldValues,
} from "react-hook-form";

import { useCallback, useFormController } from "~/libs/hooks/hooks.js";

import styles from "./styles.module.css";

const EYE_OPEN_SVG = (
	<svg
		fill="none"
		height="18"
		stroke="currentColor"
		strokeLinecap="round"
		strokeLinejoin="round"
		strokeWidth="2"
		viewBox="0 0 24 24"
		width="18"
	>
		<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
		<circle cx="12" cy="12" r="3" />
	</svg>
);

const EYE_CLOSED_SVG = (
	<svg
		fill="none"
		height="18"
		stroke="currentColor"
		strokeLinecap="round"
		strokeLinejoin="round"
		strokeWidth="2"
		viewBox="0 0 24 24"
		width="18"
	>
		<path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
		<path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
		<path d="M14.12 14.12a3 3 0 1 1-4.24-4.24" />
		<line x1="1" x2="23" y1="1" y2="23" />
	</svg>
);

type Properties<T extends FieldValues> = {
	control: Control<T, null>;
	errors: FieldErrors<T>;
	helperText?: string;
	label: string;
	name: FieldPath<T>;
	placeholder?: string;
	type?: "email" | "password" | "text";
};

const Input = <T extends FieldValues>({
	control,
	errors,
	helperText,
	label,
	name,
	placeholder = "",
	type = "text",
}: Properties<T>): React.JSX.Element => {
	const { field } = useFormController({ control, name });
	const [showPassword, setShowPassword] = useState(false);

	const error = errors[name]?.message;
	const hasError = Boolean(error);
	const hasHelperText = Boolean(helperText) && !hasError;
	const isPassword = type === "password";

	const inputClassName = [
		styles["input"],
		hasError && styles["input--error"],
		isPassword && styles["input--password"],
	]
		.filter(Boolean)
		.join(" ");

	const handleChange = useCallback(
		(event: React.ChangeEvent<HTMLInputElement>): void => {
			if (type !== "password") {
				field.onChange(event);

				return;
			}

			field.onChange(event.target.value.replaceAll(/\s/g, ""));
		},
		[field, type],
	);

	const handleTogglePassword = useCallback(
		(event: React.MouseEvent<HTMLButtonElement>): void => {
			event.preventDefault();
			setShowPassword((previous) => !previous);
		},
		[],
	);

	return (
		<label className={styles["label"]}>
			<span className={styles["label-text"]}>{label}</span>
			<span className={styles["input-wrapper"]}>
				<input
					{...field}
					className={inputClassName}
					onChange={handleChange}
					placeholder={placeholder}
					type={isPassword && showPassword ? "text" : type}
				/>
				{isPassword && (
					<button
						className={styles["toggle-password"]}
						onClick={handleTogglePassword}
						tabIndex={-1}
						type="button"
					>
						{showPassword ? EYE_CLOSED_SVG : EYE_OPEN_SVG}
					</button>
				)}
			</span>
			{hasError && (
				<span className={styles["error-text"]}>{error as string}</span>
			)}
			{hasHelperText && (
				<span className={styles["helper-text"]}>{helperText}</span>
			)}
		</label>
	);
};

export { Input };
