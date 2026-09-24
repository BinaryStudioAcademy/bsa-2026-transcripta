import { type PresetGetAllItemResponseDto } from "@transcripta/shared";
import React from "react";

import { Button, Input } from "~/libs/components/components.js";
import { Select } from "~/libs/components/select/select.js";
import { useAppForm, useCallback, useWatch } from "~/libs/hooks/hooks.js";

import { uploadFormValidationSchema } from "../../libs/validation-schemas/validation-schemas.js";
import {
	DEFAULT_PRESET_ID,
	DEFAULT_PRESET_INDEX,
	PDF_EXTENSION_REGEX,
} from "./libs/constants/constants.js";
import { type UploadFormValues } from "./libs/types/types.js";
import styles from "./styles.module.css";

type Properties = {
	fileName: string;
	isSubmitting: boolean;
	isUploaded: boolean;
	isUploading: boolean;
	onCancelUpload: () => void;
	onChangeFile: () => void;
	onProcessDocument: () => void;
	onSubmit: (values: UploadFormValues) => void;
	presetOptions: PresetGetAllItemResponseDto[];
};

const UploadForm: React.FC<Properties> = ({
	fileName,
	isSubmitting = false,
	isUploaded = false,
	isUploading = false,
	onCancelUpload,
	onChangeFile,
	onProcessDocument,
	onSubmit,
	presetOptions,
}: Properties) => {
	const { control, errors, handleSubmit } = useAppForm<UploadFormValues>({
		defaultValues: {
			presetId: presetOptions[DEFAULT_PRESET_INDEX]?.id ?? DEFAULT_PRESET_ID,
			title: fileName.replace(PDF_EXTENSION_REGEX, ""),
		},
		validationSchema: uploadFormValidationSchema,
	});

	const selectedPresetId = useWatch({
		control,
		name: "presetId",
	});

	const selectedPreset = presetOptions.find(
		(preset) => preset.id === Number(selectedPresetId),
	);

	const handleFormSubmit = useCallback(
		(event_: React.BaseSyntheticEvent): void => {
			void handleSubmit(onSubmit)(event_);
		},
		[handleSubmit, onSubmit],
	);

	let actionsContent = null;

	if (isUploaded) {
		actionsContent = (
			<>
				<Button
					isDisabled={isSubmitting}
					isPrimary
					label={isSubmitting ? "Processing..." : "Start Processing"}
					onClick={onProcessDocument}
					type="button"
				/>
				<Button
					isDisabled={isSubmitting}
					label="Change file"
					onClick={onChangeFile}
					type="button"
				/>
			</>
		);
	} else if (isUploading) {
		actionsContent = (
			<Button label="Cancel Upload" onClick={onCancelUpload} type="button" />
		);
	} else {
		actionsContent = (
			<>
				<Button
					isDisabled={isSubmitting}
					isPrimary
					label="Upload"
					type="submit"
				/>
				<Button
					isDisabled={isSubmitting}
					label="Change file"
					onClick={onChangeFile}
					type="button"
				/>
			</>
		);
	}

	return (
		<form className={styles["upload-form"]} onSubmit={handleFormSubmit}>
			<Input
				control={control}
				errors={errors}
				label="Title"
				name="title"
				type="text"
			/>
			<Select
				control={control}
				errors={errors}
				helperText={selectedPreset?.description ?? ""}
				label="Presets"
				name="presetId"
				options={presetOptions}
			/>
			<div className={styles["upload-form__actions"]}>{actionsContent}</div>
		</form>
	);
};

export { UploadForm };
