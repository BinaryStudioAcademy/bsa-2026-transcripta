import React from "react";
import {
	type Control,
	type FieldErrors,
	type FieldPath,
	type FieldValues,
} from "react-hook-form";

import { useFormController } from "~/libs/hooks/hooks.js";

import styles from "./styles.module.css";

type Properties<T extends FieldValues> = {
	control: Control<T, null>;
	errors: FieldErrors<T>;
	label: string;
	name: FieldPath<T>;
	placeholder?: string;
	type?: "email" | "password" | "text";
};

const Input = <T extends FieldValues>({
	control,
	errors,
	label,
	name,
	placeholder = "",
	type = "text",
}: Properties<T>): React.JSX.Element => {
	const { field } = useFormController({ control, name });

	const error = errors[name]?.message;
	const hasError = Boolean(error);

	const inputClassName = `${styles["input"] as string} ${hasError ? (styles["input--error"] as string) : ""}`;

	return (
		<label className={styles["label"]}>
			<span className={styles["label-text"]}>{label}</span>
			<input
				{...field}
				className={inputClassName}
				placeholder={placeholder}
				type={type}
			/>
			{hasError && (
				<span className={styles["error-text"]}>{error as string}</span>
			)}
		</label>
	);
};

export { Input };
