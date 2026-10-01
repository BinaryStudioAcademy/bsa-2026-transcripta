import { Button } from "~/libs/components/components.js";
import { useEffect } from "~/libs/hooks/hooks.js";

import styles from "./confirm-dialog.module.css";

type Properties = {
	checkboxLabel?: string;
	confirmLabel?: string;
	description: string;
	isCheckboxChecked?: boolean;
	onCancel: () => void;
	onCheckboxChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
	onConfirm: () => void;
	title: string;
};

const ConfirmDialog: React.FC<Properties> = ({
	checkboxLabel,
	confirmLabel = "Delete",
	description,
	isCheckboxChecked = false,
	onCancel,
	onCheckboxChange,
	onConfirm,
	title,
}: Properties) => {
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

	return (
		<div className={styles["scrim"]}>
			<button
				aria-label="Close dialog"
				className={styles["scrim-close"]}
				onClick={onCancel}
				type="button"
			/>
			<div aria-modal="true" className={styles["dialog"]} role="dialog">
				<h2 className={styles["title"]}>{title}</h2>
				<p className={styles["description"]}>{description}</p>

				{checkboxLabel && onCheckboxChange && (
					<label className={styles["checkbox"]}>
						<input
							checked={isCheckboxChecked}
							onChange={onCheckboxChange}
							type="checkbox"
						/>
						<span>{checkboxLabel}</span>
					</label>
				)}

				<div className={styles["actions"]}>
					<Button label="Cancel" onClick={onCancel} />
					<Button isDanger label={confirmLabel} onClick={onConfirm} />
				</div>
			</div>
		</div>
	);
};

export { ConfirmDialog };
