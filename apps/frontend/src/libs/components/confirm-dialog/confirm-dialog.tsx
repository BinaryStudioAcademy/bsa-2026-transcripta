import { Button } from "~/libs/components/components.js";
import { useCallback, useEffect } from "~/libs/hooks/hooks.js";

import styles from "./confirm-dialog.module.css";

type Properties = {
	confirmLabel?: string;
	description: string;
	onCancel: () => void;
	onConfirm: () => void;
	title: string;
};

const ConfirmDialog: React.FC<Properties> = ({
	confirmLabel = "Delete",
	description,
	onCancel,
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

	const handleScrimClick = useCallback(
		(event: React.MouseEvent<HTMLDivElement>): void => {
			if (event.target === event.currentTarget) {
				onCancel();
			}
		},
		[onCancel],
	);

	return (
		// eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions -- Escape (handled above) is the keyboard equivalent for dismissing the scrim
		<div className={styles["scrim"]} onClick={handleScrimClick}>
			<div aria-modal="true" className={styles["dialog"]} role="dialog">
				<h2 className={styles["title"]}>{title}</h2>
				<p className={styles["description"]}>{description}</p>

				<div className={styles["actions"]}>
					<Button label="Cancel" onClick={onCancel} />
					<Button isDanger label={confirmLabel} onClick={onConfirm} />
				</div>
			</div>
		</div>
	);
};

export { ConfirmDialog };
