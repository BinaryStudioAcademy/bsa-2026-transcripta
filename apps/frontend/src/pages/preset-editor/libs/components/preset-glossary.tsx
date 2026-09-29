import React from "react";

import { Button } from "~/libs/components/components.js";

import type { GlossaryEntry } from "../../libs/types/preset-editor.types.js";

import { GLOSSARY_TYPES } from "../../libs/constants/preset-editor.constants.js";

type Properties = {
	entries: GlossaryEntry[];
	isDisabled: boolean;
	onAddEntry: () => void;
	onKindOptionClick: (event: React.MouseEvent<HTMLButtonElement>) => void;
	onRemoveButtonClick: (event: React.MouseEvent<HTMLButtonElement>) => void;
	onTypeButtonClick: (event: React.MouseEvent<HTMLButtonElement>) => void;
	onValueChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
	openTypeId: null | string;
};

const PresetGlossary: React.FC<Properties> = ({
	entries,
	isDisabled,
	onAddEntry,
	onKindOptionClick,
	onRemoveButtonClick,
	onTypeButtonClick,
	onValueChange,
	openTypeId,
}) => {
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
						<div className="preset-editor__type-selector">
							<Button
								aria-expanded={openTypeId === entry.id}
								aria-haspopup="listbox"
								className="preset-editor__type-button"
								data-id={entry.id}
								isDisabled={isDisabled}
								isSmall
								onClick={onTypeButtonClick}
							>
								<span>{entry.kind}</span>
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

						<input
							className="tx-input preset-editor__glossary-input"
							data-id={entry.id}
							disabled={isDisabled}
							id={`glossary-value-${entry.id}`}
							onChange={onValueChange}
							value={entry.value}
						/>

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
