import React, { type ChangeEvent } from "react";

import type { PresetGetAllItemResponseDto } from "~/modules/presets/libs/types/types.js";

import { EMPTY_LENGTH } from "~/libs/constants/constants.js";

type Properties = {
	basePresetId: null | number;
	description: string;
	errors: {
		description: null | string;
		instructions: null | string;
		name: null | string;
	};
	instructions: string;
	isDisabled: boolean;
	name: string;
	onBasePresetChange: (event: ChangeEvent<HTMLSelectElement>) => void;
	onDescriptionChange: (event: ChangeEvent<HTMLTextAreaElement>) => void;
	onInstructionsChange: (event: ChangeEvent<HTMLTextAreaElement>) => void;
	onNameChange: (event: ChangeEvent<HTMLInputElement>) => void;
	presets: PresetGetAllItemResponseDto[];
};

const PresetBasicFields: React.FC<Properties> = ({
	basePresetId,
	description,
	errors,
	instructions,
	isDisabled,
	name,
	onBasePresetChange,
	onDescriptionChange,
	onInstructionsChange,
	onNameChange,
	presets,
}) => {
	return (
		<>
			<div className="preset-editor__basic-fields">
				<div className="preset-editor__field">
					<label className="tx-label" htmlFor="based-on">
						Based on
					</label>

					<div className="tx-selectwrap">
						<select
							className="tx-input"
							disabled={presets.length === EMPTY_LENGTH || isDisabled}
							id="based-on"
							onChange={onBasePresetChange}
							value={basePresetId ?? ""}
						>
							{presets.length === EMPTY_LENGTH && (
								<option value="">Loading presets...</option>
							)}

							{presets.map((preset) => (
								<option key={preset.id} value={preset.id}>
									{`${preset.name} v${String(preset.version)}`}
								</option>
							))}
						</select>
					</div>
				</div>

				<div className="preset-editor__field">
					<label className="tx-label" htmlFor="preset-name">
						Name
					</label>

					<input
						className={`tx-input ${errors.name ? "preset-editor__input-error" : ""}`}
						disabled={isDisabled}
						id="preset-name"
						onChange={onNameChange}
						value={name}
					/>

					{errors.name && (
						<span className="preset-editor__error-text">{errors.name}</span>
					)}
				</div>
			</div>

			<div className="preset-editor__section">
				<label className="tx-label" htmlFor="preset-description">
					Description <span className="preset-editor__hint">(optional)</span>
				</label>

				<textarea
					className={`tx-input preset-editor__description ${
						errors.description ? "preset-editor__input-error" : ""
					}`}
					disabled={isDisabled}
					id="preset-description"
					onChange={onDescriptionChange}
					placeholder="Shown under the name in the presets list"
					rows={1}
					value={description}
				/>

				{errors.description && (
					<span className="preset-editor__error-text">
						{errors.description}
					</span>
				)}
			</div>

			<div className="preset-editor__section">
				<label className="tx-label" htmlFor="instructions">
					Instructions for the model
				</label>

				<textarea
					className={`tx-input preset-editor__instructions ${
						errors.instructions ? "preset-editor__input-error" : ""
					}`}
					disabled={isDisabled}
					id="instructions"
					onChange={onInstructionsChange}
					rows={3}
					value={instructions}
				/>

				{errors.instructions && (
					<span className="preset-editor__error-text">
						{errors.instructions}
					</span>
				)}
			</div>
		</>
	);
};

export { PresetBasicFields };
