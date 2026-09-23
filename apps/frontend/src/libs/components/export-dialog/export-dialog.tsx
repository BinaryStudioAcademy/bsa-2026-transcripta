import { Button } from "~/libs/components/components.js";
import {
	EXPORT_FORMAT_OPTIONS,
	INITIAL_COUNT,
} from "~/libs/constants/constants.js";
import { useCallback, useEffect, useState } from "~/libs/hooks/hooks.js";
import { type ExportFormatValue } from "~/modules/documents/documents.js";
import { ExportFormat } from "~/modules/documents/libs/enums/enums.js";

import styles from "./styles.module.css";

type Properties = {
	documentTitle: string;
	onCancel: () => void;
	onConfirm: (format: ExportFormatValue) => void;
	pagesTotal: number;
	pagesVerified: number;
};

const ExportDialog: React.FC<Properties> = ({
	documentTitle,
	onCancel,
	onConfirm,
	pagesTotal,
	pagesVerified,
}: Properties) => {
	const [format, setFormat] = useState<ExportFormatValue>(ExportFormat.CSV);
	const pagesUnverified = pagesTotal - pagesVerified;

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

	const handleFormatChange = useCallback(
		(event: React.ChangeEvent<HTMLInputElement>): void => {
			setFormat(event.target.value as ExportFormatValue);
		},
		[],
	);

	const handleConfirmClick = useCallback((): void => {
		onConfirm(format);
	}, [format, onConfirm]);

	return (
		// eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions -- Escape (handled above) is the keyboard equivalent for dismissing the scrim
		<div className={styles["scrim"]} onClick={handleScrimClick}>
			<div aria-modal="true" className={styles["dialog"]} role="dialog">
				<h2 className={styles["title"]}>
					Export &ldquo;{documentTitle}&rdquo;
				</h2>

				<fieldset className={styles["fieldset"]}>
					<legend className={styles["label"]}>Format</legend>
					{EXPORT_FORMAT_OPTIONS.map((value) => (
						<label className={styles["option"]} key={value}>
							<input
								checked={format === value}
								name="export-format"
								onChange={handleFormatChange}
								type="radio"
								value={value}
							/>
							{value.toUpperCase()}
						</label>
					))}
				</fieldset>

				{pagesUnverified > INITIAL_COUNT && (
					<p className={styles["description"]}>
						<span className="tabular-figures">{pagesUnverified}</span> of{" "}
						<span className="tabular-figures">{pagesTotal}</span> pages are
						still unverified. They will be exported as the model read them,
						unchecked.
					</p>
				)}

				<div className={styles["actions"]}>
					<Button label="Cancel" onClick={onCancel} type="button" />
					<Button
						isPrimary
						label="Export"
						onClick={handleConfirmClick}
						type="button"
					/>
				</div>
			</div>
		</div>
	);
};

export { ExportDialog };
