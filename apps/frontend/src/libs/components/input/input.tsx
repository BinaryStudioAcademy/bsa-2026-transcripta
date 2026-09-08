import React from "react";
import {
	type Control,
	type FieldErrors,
	type FieldPath,
	type FieldValues,
} from "react-hook-form";

import { useCallback, useFormController } from "~/libs/hooks/hooks.js";

import { PASSWORD_TRIM_END_INPUT_TYPES } from "./libs/constants/constants.js";
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

const getPasswordValue = (value: string, inputType: string): string => {
	const trimmedStartValue = value.trimStart();

	return PASSWORD_TRIM_END_INPUT_TYPES.has(inputType)
		? trimmedStartValue.trimEnd()
		: trimmedStartValue;
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

	const error = errors[name]?.message;
	const hasError = Boolean(error);
	const hasHelperText = Boolean(helperText) && !hasError;

	const inputClassName = [styles["input"], hasError && styles["input--error"]]
		.filter(Boolean)
		.join(" ");

	const trimPasswordValue = useCallback((): void => {
		const value: unknown = field.value;

		if (type === "password" && typeof value === "string") {
			const trimmedValue = value.trim();

			if (trimmedValue !== value) {
				field.onChange(trimmedValue);
			}
		}
	}, [field, type]);

	const handleBlur = useCallback((): void => {
		trimPasswordValue();
		field.onBlur();
	}, [field, trimPasswordValue]);

	const handleChange = useCallback(
		(event: React.ChangeEvent<HTMLInputElement>): void => {
			if (type !== "password") {
				field.onChange(event);

				return;
			}

			const { nativeEvent } = event;
			const inputType =
				nativeEvent instanceof InputEvent ? nativeEvent.inputType : "";

			field.onChange(getPasswordValue(event.target.value, inputType));
		},
		[field, type],
	);

	const handleKeyDown = useCallback(
		(event: React.KeyboardEvent<HTMLInputElement>): void => {
			if (event.key === "Enter") {
				trimPasswordValue();
			}
		},
		[trimPasswordValue],
	);

	return (
		<label className={styles["label"]}>
			<span className={styles["label-text"]}>{label}</span>
			<input
				{...field}
				className={inputClassName}
				onBlur={handleBlur}
				onChange={handleChange}
				onKeyDown={handleKeyDown}
				placeholder={placeholder}
				type={type}
			/>
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
