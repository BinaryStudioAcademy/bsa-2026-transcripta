import { LexiconInvalidateValidationSchema } from "@transcripta/shared";

import { Button, Input } from "~/libs/components/components.js";
import { useAppForm, useCallback, useEffect } from "~/libs/hooks/hooks.js";

import styles from "./styles.module.css";

type FormValues = {
	reason: string;
};

type Properties = {
	isSubmitting: boolean;
	onCancel: () => void;
	onConfirm: (reason: string) => void;
	word: string;
};

const MarkWrongDialog: React.FC<Properties> = ({
	isSubmitting,
	onCancel,
	onConfirm,
	word,
}: Properties) => {
	const { control, errors, handleSubmit } = useAppForm<FormValues>({
		defaultValues: { reason: "" },
		validationSchema: LexiconInvalidateValidationSchema,
	});

	useEffect(() => {
		const handleKeyDown = (event: KeyboardEvent): void => {
			if (event.key === "Escape") {
				onCancel();
			}
		};

		document.addEventListener("keydown", handleKeyDown);

		return () => {
			document.removeEventListener("keydown", handleKeyDown);
		};
	}, [onCancel]);

	const handleFormSubmit = useCallback(
		(event_: React.BaseSyntheticEvent): void => {
			void handleSubmit((data) => {
				onConfirm(data.reason.trim());
			})(event_);
		},
		[handleSubmit, onConfirm],
	);

	return (
		<div className={styles["scrim"]}>
			<button
				aria-label="Close dialog"
				className={styles["scrim-close"]}
				onClick={onCancel}
				type="button"
			/>
			<div aria-modal="true" className={styles["dialog"]} role="dialog">
				<h2 className={styles["title"]}>Mark “{word}” as wrong</h2>
				<p className={styles["description"]}>
					It leaves the lexicon for future pages. Pages you already verified
					keep their text.
				</p>
				<form onSubmit={handleFormSubmit}>
					<Input
						control={control}
						errors={errors}
						label="Reason"
						name="reason"
						placeholder="Misread — correct form is…"
					/>
					<div className={styles["actions"]}>
						<Button
							isDisabled={isSubmitting}
							label="Cancel"
							onClick={onCancel}
							type="button"
						/>
						<Button
							isDanger
							isDisabled={isSubmitting}
							label="Mark wrong"
							type="submit"
						/>
					</div>
				</form>
			</div>
		</div>
	);
};

export { MarkWrongDialog };
