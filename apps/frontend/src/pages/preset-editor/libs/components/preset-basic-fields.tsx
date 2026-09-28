import React, { type ChangeEvent } from "react";

import type { PresetGetAllItemResponseDto } from "~/modules/presets/libs/types/types.js";

import { EMPTY_LENGTH } from "~/libs/constants/constants.js";

type Properties = {
	basePresetId: null | number;
	instructions: string;
	isDisabled: boolean;
	name: string;
	onBasePresetChange: (event: ChangeEvent<HTMLSelectElement>) => void;
	onInstructionsChange: (event: ChangeEvent<HTMLTextAreaElement>) => void;
	onNameChange: (event: ChangeEvent<HTMLInputElement>) => void;
	presets: PresetGetAllItemResponseDto[];
};

const PresetBasicFields: React.FC<Properties> = ({
	basePresetId,
	instructions,
	isDisabled,
	name,
	onBasePresetChange,
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
						className="tx-input"
						disabled={isDisabled}
						id="preset-name"
						onChange={onNameChange}
						value={name}
					/>
				</div>
			</div>

			<div className="preset-editor__section">
				<label className="tx-label" htmlFor="instructions">
					Instructions for the model
				</label>

				<textarea
					className="tx-input preset-editor__instructions"
					disabled={isDisabled}
					id="instructions"
					onChange={onInstructionsChange}
					rows={3}
					value={instructions}
				/>
			</div>
		</>
	);
};

export { PresetBasicFields };
