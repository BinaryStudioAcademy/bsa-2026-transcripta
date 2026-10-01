import React, { useState } from "react";

import { Button } from "~/libs/components/components.js";
import {
	BUDGET_FIELD_NAME,
	CURRENCY_DECIMAL_PLACES,
	DECIMAL_POINT,
	DECIMAL_POSITION,
	EMPTY_STRING,
	GET_BUDGET_LIMIT_ERROR_MESSAGE,
	NO_MORE_THAN_TWO_DECIMALS_BUDGET,
	SUGGESTED_LIMIT_INCREMENT,
} from "~/libs/constants/constants.js";
import { DocumentValidationRule } from "~/libs/enums/enums.js";
import { formatMoney } from "~/libs/helpers/helpers.js";
import {
	useAppForm,
	useCallback,
	useFocusTrap,
	useFormController,
} from "~/libs/hooks/hooks.js";

import styles from "./styles.module.css";
import {
	type FormValuesRaiseBudgetLimit,
	type Properties,
} from "./types/types.js";
import { DocumentBudgetUpdateValidationSchema } from "./validation-schemas/validation-schemas.js";

const RaiseLimitDialog: React.FC<
	Properties & { serverError?: null | string }
> = ({ currentLimitUsd, onCancel, onSubmit, serverError, spentUsd }) => {
	const suggestedLimit = (
		Number(currentLimitUsd) + SUGGESTED_LIMIT_INCREMENT
	).toFixed(CURRENCY_DECIMAL_PLACES);

	const dialogReference = useFocusTrap<HTMLDivElement>();
	const [validationError, setValidationError] = useState<null | string>(null);
	const [activeServerError, setActiveServerError] = useState<
		null | string | undefined
	>(serverError);

	React.useEffect(() => {
		setActiveServerError(serverError);
	}, [serverError]);

	const { control, errors, handleSubmit } =
		useAppForm<FormValuesRaiseBudgetLimit>({
			defaultValues: { limitUsd: suggestedLimit },
			validationSchema: DocumentBudgetUpdateValidationSchema,
		});

	const { field } = useFormController({
		control,
		name: BUDGET_FIELD_NAME,
	});

	const handleInputChange = useCallback(
		(event: React.ChangeEvent<HTMLInputElement>): void => {
			const value = event.target.value.trim();

			if (
				value !== EMPTY_STRING &&
				!DocumentValidationRule.LIMIT_USD_REGEX.test(value)
			) {
				const parts = value.split(DECIMAL_POINT);
				if (
					parts[DECIMAL_POSITION] &&
					parts[DECIMAL_POSITION].length > CURRENCY_DECIMAL_PLACES
				) {
					setValidationError(NO_MORE_THAN_TWO_DECIMALS_BUDGET);
				} else {
					setValidationError(null);
				}
			} else {
				setValidationError(null);
			}
			if (activeServerError) {
				setActiveServerError(null);
			}
			field.onChange(event);
		},
		[field, activeServerError],
	);

	const handleFormSubmit = useCallback(
		(event_: React.BaseSyntheticEvent): void => {
			void handleSubmit((data) => {
				const rawLimit = data.limitUsd.trim();

				if (!DocumentValidationRule.LIMIT_USD_REGEX.test(rawLimit)) {
					setValidationError(NO_MORE_THAN_TWO_DECIMALS_BUDGET);
					return;
				}

				const enteredLimit = Number(rawLimit);
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

	const displayError =
		errors.limitUsd?.message || validationError || activeServerError;

	return (
		<div className={styles["scrim"]}>
			<button
				aria-label="Close dialog"
				className={styles["scrim-close"]}
				onClick={onCancel}
				type="button"
			/>
			<div
				aria-modal="true"
				className={styles["dialog"]}
				ref={dialogReference}
				role="dialog"
			>
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

					{displayError && (
						<p className={styles["error-message"]}>{displayError}</p>
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
