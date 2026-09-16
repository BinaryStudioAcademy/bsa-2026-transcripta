import { DocumentBudgetUpdateValidationSchema } from "@transcripta/shared";
import React, { useState } from "react";

import { Button } from "~/libs/components/components.js";
import {
	BUDGET_FIELD_NAME,
	CURRENCY_DECIMAL_PLACES,
	GET_BUDGET_LIMIT_ERROR_MESSAGE,
	SUGGESTED_LIMIT_INCREMENT,
} from "~/libs/constants/constants.js";
import { formatMoney } from "~/libs/helpers/helpers.js";
import {
	useAppForm,
	useCallback,
	useFormController,
} from "~/libs/hooks/hooks.js";

import styles from "./styles.module.css";
import {
	type FormValuesRaiseBudgetLimit,
	type Properties,
} from "./types/types.js";

const RaiseLimitDialog: React.FC<Properties> = ({
	currentLimitUsd,
	onCancel,
	onSubmit,
	spentUsd,
}: Properties) => {
	const suggestedLimit = (
		Number(currentLimitUsd) + SUGGESTED_LIMIT_INCREMENT
	).toFixed(CURRENCY_DECIMAL_PLACES);

	const [validationError, setValidationError] = useState<null | string>(null);

	const { control, handleSubmit } = useAppForm<FormValuesRaiseBudgetLimit>({
		defaultValues: { limitUsd: suggestedLimit },
		validationSchema: DocumentBudgetUpdateValidationSchema,
	});

	const { field } = useFormController({
		control,
		name: BUDGET_FIELD_NAME,
	});

	const handleInputChange = useCallback(
		(event: React.ChangeEvent<HTMLInputElement>): void => {
			if (validationError) {
				setValidationError(null);
			}
			field.onChange(event);
		},
		[field, validationError],
	);

	const handleFormSubmit = useCallback(
		(event_: React.BaseSyntheticEvent): void => {
			void handleSubmit((data) => {
				const enteredLimit = Number(data.limitUsd);
				const currentSpent = Number(spentUsd);
				const formattedSpent = formatMoney(spentUsd);

				if (enteredLimit <= currentSpent) {
					setValidationError(GET_BUDGET_LIMIT_ERROR_MESSAGE(formattedSpent));
					return;
				}

				onSubmit(data.limitUsd);
			})(event_);
		},
		[handleSubmit, spentUsd, onSubmit],
	);

	const handleScrimClick = useCallback(
		(event: React.MouseEvent<HTMLDivElement>): void => {
			if (event.target === event.currentTarget) {
				onCancel();
			}
		},
		[onCancel],
	);

	return (
		// eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions
		<div className={styles["scrim"]} onClick={handleScrimClick}>
			<div aria-modal="true" className={styles["dialog"]} role="dialog">
				<h2 className={styles["title"]}>Raise the limit</h2>
				<p className={styles["description"]}>
					Transcription stopped at{" "}
					<span
						className={["tx-num", styles["num-highlight"]]
							.filter(Boolean)
							.join(" ")}
					>
						{formatMoney(spentUsd)} / {formatMoney(currentLimitUsd)}
					</span>
					. It resumes as soon as the limit is higher.
				</p>
				<form onSubmit={handleFormSubmit}>
					<label className={styles["label"]} htmlFor="lim">
						New limit
					</label>
					<div className={styles["input-container"]}>
						<span
							className={["tx-num", styles["currency-symbol"]]
								.filter(Boolean)
								.join(" ")}
						>
							$
						</span>
						<input
							{...field}
							className={["tx-input", styles["input"]]
								.filter(Boolean)
								.join(" ")}
							id="lim"
							onChange={handleInputChange}
							placeholder={suggestedLimit}
							type="text"
						/>
					</div>

					{validationError && (
						<p className={styles["error-message"]}>{validationError}</p>
					)}

					<div className={styles["actions"]}>
						<Button label="Cancel" onClick={onCancel} type="button" />
						<Button isPrimary label="Raise the limit" type="submit" />
					</div>
				</form>
			</div>
		</div>
	);
};

export { RaiseLimitDialog };
