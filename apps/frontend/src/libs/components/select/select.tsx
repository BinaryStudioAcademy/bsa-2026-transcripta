import React from "react";
import {
	type Control,
	type FieldErrors,
	type FieldPath,
	type FieldValues,
} from "react-hook-form";

import { useCallback, useFormController } from "~/libs/hooks/hooks.js";
import { type SelectOption } from "~/libs/types/types.js";

import styles from "./styles.module.css";

type Properties<T extends FieldValues> = {
	control: Control<T, null>;
	errors: FieldErrors<T>;
	helperText?: string;
	label: string;
	name: FieldPath<T>;
	options: SelectOption[];
};

const Select = <T extends FieldValues>({
	control,
	errors,
	helperText,
	label,
	name,
	options,
}: Properties<T>): React.JSX.Element => {
	const { field } = useFormController({ control, name });

	const error = errors[name]?.message;
	const hasError = Boolean(error);
	const hasHelperText = Boolean(helperText) && !hasError;

	const selectClassName = [
		styles["input"],
		styles["tx-input"],
		hasError && styles["input--error"],
	]
		.filter(Boolean)
		.join(" ");

	const handleChange = useCallback(
		(event_: React.ChangeEvent<HTMLSelectElement>): void => {
			field.onChange(Number(event_.target.value));
		},
		[field],
	);

	return (
		<label className={styles["label"]}>
			<span className={styles["label-text"]}>{label}</span>
			<span className={styles["tx-selectwrap"]}>
				<select {...field} className={selectClassName} onChange={handleChange}>
					{options.map((option) => (
						<option key={option.id} value={option.id}>
							{option.name}
						</option>
					))}
				</select>
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

export { Select };
