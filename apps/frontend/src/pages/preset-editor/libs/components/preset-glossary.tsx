import React from "react";

import { Button } from "~/libs/components/components.js";
import { useEffect, useRef } from "~/libs/hooks/hooks.js";

import type { GlossaryEntry } from "../../libs/types/preset-editor.types.js";

import { GLOSSARY_TYPES } from "../../libs/constants/preset-editor.constants.js";

type Properties = {
	entries: GlossaryEntry[];
	errors: Record<string, string>;
	isDisabled: boolean;
	newEntryId: null | string;
	onAddEntry: () => void;
	onCloseTypeSelector: () => void;
	onKindOptionClick: (event: React.MouseEvent<HTMLButtonElement>) => void;
	onRemoveButtonClick: (event: React.MouseEvent<HTMLButtonElement>) => void;
	onTypeButtonClick: (event: React.MouseEvent<HTMLButtonElement>) => void;
	onValueChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
	openTypeId: null | string;
};

const PresetGlossary: React.FC<Properties> = ({
	entries,
	errors,
	isDisabled,
	newEntryId,
	onAddEntry,
	onCloseTypeSelector,
	onKindOptionClick,
	onRemoveButtonClick,
	onTypeButtonClick,
	onValueChange,
	openTypeId,
}) => {
	const typeSelectorReference = useRef<HTMLDivElement>(null);
	const newEntryInputReference = useRef<HTMLInputElement>(null);

	useEffect(() => {
		if (!newEntryId) {
			return;
		}

		newEntryInputReference.current?.focus();
	}, [newEntryId]);

	useEffect(() => {
		const handleDocumentMouseDown = (event: MouseEvent): void => {
			if (
				typeSelectorReference.current &&
				!typeSelectorReference.current.contains(event.target as Node)
			) {
				onCloseTypeSelector();
			}
		};

		const handleDocumentKeyDown = (event: KeyboardEvent): void => {
			if (event.key === "Escape") {
				onCloseTypeSelector();
			}
		};

		document.addEventListener("mousedown", handleDocumentMouseDown);
		document.addEventListener("keydown", handleDocumentKeyDown);

		return (): void => {
			document.removeEventListener("mousedown", handleDocumentMouseDown);
			document.removeEventListener("keydown", handleDocumentKeyDown);
		};
	}, [onCloseTypeSelector]);

	return (
		<div className="preset-editor__section preset-editor__glossary">
			<div className="preset-editor__section-heading">
				<h2 className="preset-editor__section-title">
					Seed glossary
					<span className="preset-editor__section-subtitle">
						{" "}
						— known names and phrases to help the first pages
					</span>
				</h2>

				<Button
					isDisabled={isDisabled}
					isSecondary
					isSmall
					label="+ add word"
					onClick={onAddEntry}
				/>
			</div>

			<div className="preset-editor__glossary-list">
				{entries.map((entry) => (
					<div className="preset-editor__glossary-row" key={entry.id}>
						<div
							className="preset-editor__type-selector"
							ref={openTypeId === entry.id ? typeSelectorReference : null}
						>
							<Button
								aria-expanded={openTypeId === entry.id}
								aria-haspopup="listbox"
								className="preset-editor__type-button"
								data-id={entry.id}
								isDisabled={isDisabled}
								isSmall
								onClick={onTypeButtonClick}
							>
								<span>{entry.kind.replaceAll("_", " ")}</span>
								<span className="preset-editor__type-chevron">▾</span>
							</Button>

							{openTypeId === entry.id && (
								<div
									aria-label="Glossary kind"
									className="preset-editor__type-menu"
									role="listbox"
								>
									{GLOSSARY_TYPES.map((kind) => (
										<Button
											aria-selected={entry.kind === kind}
											className="preset-editor__type-option"
											data-id={entry.id}
											data-kind={kind}
											isSmall
											key={kind}
											onClick={onKindOptionClick}
											role="option"
										>
											<span>{kind.replaceAll("_", " ")}</span>
											<span className="preset-editor__type-option-check">
												{entry.kind === kind ? "✓" : ""}
											</span>
										</Button>
									))}
								</div>
							)}
						</div>

						<label
							className="visually-hidden"
							htmlFor={`glossary-value-${entry.id}`}
						>
							Glossary value
						</label>

						<div className="preset-editor__glossary-value">
							<input
								className={`tx-input preset-editor__glossary-input ${
									errors[entry.id] ? "preset-editor__input-error" : ""
								}`}
								data-id={entry.id}
								disabled={isDisabled}
								id={`glossary-value-${entry.id}`}
								onChange={onValueChange}
								placeholder="Enter a term"
								ref={entry.id === newEntryId ? newEntryInputReference : null}
								value={entry.value}
							/>

							{errors[entry.id] && (
								<span className="preset-editor__error-text">
									{errors[entry.id]}
								</span>
							)}
						</div>

						<Button
							aria-label={`Remove ${entry.value || "glossary entry"}`}
							className="preset-editor__remove-button"
							data-id={entry.id}
							isDisabled={isDisabled}
							isSmall
							onClick={onRemoveButtonClick}
						>
							×
						</Button>
					</div>
				))}
			</div>
		</div>
	);
};

export { PresetGlossary };
