import { DocumentValidationRule, EMPTY_LENGTH } from "@transcripta/shared";
import React from "react";

import { Button, Input } from "~/libs/components/components.js";
import { Select } from "~/libs/components/select/select.js";
import { useAppForm, useCallback } from "~/libs/hooks/hooks.js";

import { uploadFormValidationSchema } from "../../libs/validation-schemas/validation-schemas.js";
import {
	DEFAULT_PRESET_ID,
	DEFAULT_PRESET_INDEX,
	MOCK_PRESET_OPTIONS,
	PDF_EXTENSION_REGEX,
} from "./libs/constants/constants.js";
import { type UploadFormValues } from "./libs/types/types.js";
import styles from "./styles.module.css";

const TITLE_FALLBACK_SLICE_LENGTH = 47;
const TITLE_FALLBACK_ELLIPSIS = "...";

const getDefaultTitle = (fileName: string): string => {
	const rawTitle = fileName.replace(PDF_EXTENSION_REGEX, "");

	if (rawTitle.length > DocumentValidationRule.MAX_TITLE_LENGTH) {
		return `${rawTitle.slice(EMPTY_LENGTH, TITLE_FALLBACK_SLICE_LENGTH)}${TITLE_FALLBACK_ELLIPSIS}`;
	}

	return rawTitle;
};

type Properties = {
	fileName: string;
	isSubmitting: boolean;
	isUploaded: boolean;
	onCancelUpload: () => void;
	onChangeFile: () => void;
	onProcessDocument: () => void;
	onSubmit: (values: UploadFormValues) => void;
	presetOptions?: typeof MOCK_PRESET_OPTIONS;
};

const UploadForm: React.FC<Properties> = ({
	fileName,
	isSubmitting = false,
	isUploaded = false,
	onCancelUpload,
	onChangeFile,
	onProcessDocument,
	onSubmit,
	presetOptions = MOCK_PRESET_OPTIONS,
}: Properties) => {
	const { control, errors, handleSubmit } = useAppForm<UploadFormValues>({
		defaultValues: {
			presetId: presetOptions[DEFAULT_PRESET_INDEX]?.id ?? DEFAULT_PRESET_ID,
			title: getDefaultTitle(fileName),
		},
		validationSchema: uploadFormValidationSchema,
	});

	const handleFormSubmit = useCallback(
		(event_: React.BaseSyntheticEvent): void => {
			void handleSubmit(onSubmit)(event_);
		},
		[handleSubmit, onSubmit],
	);

	return (
		<form className={styles["upload-form"]} onSubmit={handleFormSubmit}>
			<Input
				control={control}
				errors={errors}
				label="Title"
				maxLength={DocumentValidationRule.MAX_TITLE_LENGTH}
				name="title"
				type="text"
			/>
			<Select
				control={control}
				errors={errors}
				label="Presets"
				name="presetId"
				options={presetOptions}
			/>
			<div className={styles["upload-form__actions"]}>
				{isUploaded && (
					<Button
						isPrimary
						label="Start Processing"
						onClick={onProcessDocument}
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
