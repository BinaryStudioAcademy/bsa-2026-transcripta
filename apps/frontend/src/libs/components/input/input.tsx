import React, { useCallback, useState } from "react";
import {
	type Control,
	type FieldErrors,
	type FieldPath,
	type FieldValues,
} from "react-hook-form";

import { EyeIcon } from "~/libs/components/icon/eye-icon.js";
import { EyeOffIcon } from "~/libs/components/icon/eye-off-icon.js";
import { useFormController } from "~/libs/hooks/hooks.js";

import styles from "./styles.module.css";

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
	const [isPasswordVisible, setIsPasswordVisible] = useState<boolean>(false);

	const isPasswordType = type === "password";

	const handleTogglePassword = useCallback(() => {
		setIsPasswordVisible((previousState) => !previousState);
	}, []);

	const error = errors[name]?.message;
	const hasError = Boolean(error);
	const hasHelperText = Boolean(helperText) && !hasError;

	let inputType: "email" | "password" | "text" = type;

	if (isPasswordType) {
		inputType = isPasswordVisible ? "text" : "password";
	}

	const inputClassName = [styles["input"], hasError && styles["input--error"]]
		.filter(Boolean)
		.join(" ");

	return (
		<label className={styles["label"]}>
			<span className={styles["label-text"]}>{label}</span>
			<div className={styles["input-container"]}>
				<input
					{...field}
					className={inputClassName}
					placeholder={placeholder}
					type={inputType}
				/>
				{isPasswordType && (
					<button
						aria-label={isPasswordVisible ? "Hide password" : "Show password"}
						className={styles["toggle-button"]}
						onClick={handleTogglePassword}
						type="button"
					>
						{isPasswordVisible ? (
							<EyeOffIcon className={styles["icon"]} />
						) : (
							<EyeIcon className={styles["icon"]} />
						)}
					</button>
				)}
			</div>
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
