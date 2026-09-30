import React from "react";

import { Button } from "~/libs/components/components.js";

type Properties = {
	isDisabled: boolean;
	isFormChanged: boolean;
	isSaving: boolean;
	onCancel: () => void;
	onSubmit: () => void;
};

const PresetEditorActions: React.FC<Properties> = ({
	isDisabled,
	isFormChanged,
	isSaving,
	onCancel,
	onSubmit,
}) => {
	return (
		<div className="preset-editor__actions">
			<p className="preset-editor__notice">
				Saving creates a new preset version. Documents already in progress
				continue using the version they started with.
			</p>

			<div className="preset-editor__buttons">
				<Button isDisabled={isDisabled} label="Cancel" onClick={onCancel} />

				<Button
					isDisabled={isDisabled || !isFormChanged}
					isPrimary
					label={isSaving ? "Saving..." : "Save preset"}
					onClick={onSubmit}
				/>
			</div>
		</div>
	);
};

export { PresetEditorActions };
