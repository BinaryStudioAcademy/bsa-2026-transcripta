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
	isStartingProcessing: boolean;
	isSubmitting: boolean;
	isUploaded: boolean;
	onCancelUpload: () => void;
	onChangeFile: () => void;
	onProcessDocument: (values: UploadFormValues) => void;
	onSubmit: (values: UploadFormValues) => void;
	presetOptions: PresetGetAllItemResponseDto[];
};

const UploadForm: React.FC<Properties> = ({
	fileName,
	isStartingProcessing = false,
	isSubmitting = false,
	isUploaded = false,
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
	const handleProcessClick = useCallback(
		(event_: React.MouseEvent<HTMLButtonElement>): void => {
			void handleSubmit(onProcessDocument)(event_);
		},
		[handleSubmit, onProcessDocument],
	);

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
			<div className={styles["upload-form__actions"]}>
				{isUploaded && (
					<Button
						isDisabled={isStartingProcessing}
						isPrimary
						label="Start Processing"
						onClick={handleProcessClick}
						type="button"
					/>
				)}
				{isSubmitting ? (
					<Button
						label="Cancel Upload"
						onClick={onCancelUpload}
						type="button"
					/>
				) : (
					<>
						<Button isPrimary label="Upload" type="submit" />
						<Button label="Change file" onClick={onChangeFile} type="button" />
					</>
				)}
			</div>
		</form>
	);
};

export { UploadForm };
