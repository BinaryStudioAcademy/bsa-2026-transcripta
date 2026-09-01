import { Button, Input } from "~/libs/components/components.js";
import { Select } from "~/libs/components/select/select.js";
import { useAppForm, useCallback } from "~/libs/hooks/hooks.js";

import {
	DEFAULT_PRESET_INDEX,
	MOCK_PRESET_OPTIONS,
} from "../../libs/constants.js";
import { type UploadFormValues } from "../../libs/types.js";
import styles from "./styles.module.css";

type Properties = {
	onChangeFile: () => void;
	onSubmit: () => void;
	presetOptions?: typeof MOCK_PRESET_OPTIONS;
};

const UploadForm: React.FC<Properties> = ({
	onChangeFile,
	onSubmit,
	presetOptions = MOCK_PRESET_OPTIONS,
}: Properties) => {
	const { control, errors, handleSubmit } = useAppForm<UploadFormValues>({
		defaultValues: {
			presetId: presetOptions[DEFAULT_PRESET_INDEX]?.id ?? DEFAULT_PRESET_INDEX,
			title: "",
		},
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
				<Button isPrimary label="Upload" type="submit" />
				<Button label="Change file" onClick={onChangeFile} type="button" />
			</div>
		</form>
	);
};

export { UploadForm };
