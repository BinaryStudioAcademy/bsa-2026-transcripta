import React, { type ChangeEvent } from "react";

import {
	Button,
	ConfirmDialog,
	LoaderOverlay,
	ThemeToggle,
} from "~/libs/components/components.js";
import {
	EMPTY_LENGTH,
	FIRST_INDEX,
	GO_BACK,
} from "~/libs/constants/constants.js";
import { AppRoute, DataStatus } from "~/libs/enums/enums.js";

import "./preset-editor.css";

import {
	useAppDispatch,
	useAppSelector,
	useCallback,
	useEffect,
	useNavigate,
	useParams,
	useState,
} from "~/libs/hooks/hooks.js";
import { notification } from "~/libs/modules/notification/notification.js";
import {
	actions as presetsActions,
	selectCreateStatus,
	selectPresets,
	selectPresetsStatus,
	selectSelectedPreset,
	selectSelectedPresetStatus,
} from "~/modules/presets/presets.js";

import {
	PresetBasicFields,
	PresetEditorActions,
	PresetGlossary,
	PresetOutputFields,
} from "./libs/components/components.js";
import {
	getInitialErrors,
	getOutputFields,
	isPresetFormDirty,
	mapSeedGlossary,
	mapValidationErrors,
} from "./libs/helpers/helpers.js";
import { usePresetGlossary } from "./libs/hooks/use-preset-glossary.js";
import {
	type PresetFormErrors,
	type PresetFormState,
} from "./libs/types/preset-editor.types.js";
import { PresetCreateValidationSchema } from "./libs/validation-schemas/validation-schemas.js";

const PresetEditor: React.FC = () => {
	const dispatch = useAppDispatch();
	const navigate = useNavigate();
	const { id } = useParams<{ id?: string }>();
	const [isCancelDialogOpen, setIsCancelDialogOpen] = useState(false);

	const createStatus = useAppSelector(selectCreateStatus);
	const presets = useAppSelector(selectPresets);
	const presetsStatus = useAppSelector(selectPresetsStatus);
	const selectedPreset = useAppSelector(selectSelectedPreset);
	const selectedPresetStatus = useAppSelector(selectSelectedPresetStatus);

	const presetId = id ? Number(id) : null;
	const isNewPreset = !id;
	const isValidPresetId =
		presetId !== null && Number.isInteger(presetId) && presetId > EMPTY_LENGTH;
	const isInvalidPresetId = Boolean(id) && !isValidPresetId;

	const [basePresetId, setBasePresetId] = useState<null | number>(
		isValidPresetId ? presetId : null,
	);
	const [name, setName] = useState("");
	const [description, setDescription] = useState("");
	const [instructions, setInstructions] = useState("");

	const [errors, setErrors] = useState<PresetFormErrors>(getInitialErrors());

	const {
		entries,
		handleAddEntry,
		handleCancelDelete,
		handleCloseTypeSelector,
		handleConfirmDelete,
		handleGlossaryValueChange,
		handleKindOptionClick,
		handleRemoveButtonClick,
		handleSkipDeleteConfirmation,
		handleTypeButtonClick,
		isDeleteDialogOpen,
		newEntryId,
		openTypeId,
		setEntries,
		setOpenTypeId,
		skipDeleteConfirmation,
	} = usePresetGlossary({
		setErrors,
	});

	const [initialFormState, setInitialFormState] =
		useState<null | PresetFormState>(null);

	const currentFormState: PresetFormState = {
		basePresetId,
		description,
		entries,
		instructions,
		name,
	};

	const isDirty = isPresetFormDirty(initialFormState, currentFormState);

	const isLoading =
		selectedPresetStatus === DataStatus.PENDING ||
		presetsStatus === DataStatus.PENDING;
	const isSaving = createStatus === DataStatus.PENDING;
	const isNotFound =
		isInvalidPresetId || selectedPresetStatus === DataStatus.REJECTED;
	const isFormDisabled = isLoading || isSaving || !selectedPreset;

	const outputFields =
		selectedPreset && basePresetId
			? getOutputFields(selectedPreset.outputSchema)
			: [];

	useEffect(() => {
		if (
			!isNewPreset ||
			basePresetId !== null ||
			presets.length === EMPTY_LENGTH
		) {
			return;
		}

		const firstPreset = presets[FIRST_INDEX];

		if (!firstPreset) {
			return;
		}

		setBasePresetId(firstPreset.id);
	}, [basePresetId, isNewPreset, presets]);

	useEffect(() => {
		if (presets.length === EMPTY_LENGTH) {
			void dispatch(presetsActions.loadAll());
		}
	}, [dispatch, presets.length]);

	useEffect(() => {
		if (basePresetId === null) {
			return;
		}

		void dispatch(presetsActions.loadById(basePresetId));
	}, [dispatch, basePresetId]);

	useEffect(() => {
		if (!selectedPreset || !basePresetId) {
			return;
		}

		const initialEntries = mapSeedGlossary(selectedPreset.seedGlossary);

		setName(selectedPreset.name);
		setDescription(selectedPreset.description);
		setInstructions(selectedPreset.instructions);
		setEntries(initialEntries);
		setOpenTypeId(null);

		setInitialFormState({
			basePresetId,
			description: selectedPreset.description,
			entries: initialEntries,
			instructions: selectedPreset.instructions,
			name: selectedPreset.name,
		});
	}, [selectedPreset, basePresetId, setEntries, setOpenTypeId]);

	const handleSubmit = useCallback((): void => {
		if (!selectedPreset || !isDirty) {
			return;
		}

		const result = PresetCreateValidationSchema.safeParse({
			description,
			familyId: selectedPreset.familyId,
			instructions,
			name,
			seedGlossary: entries.map(({ kind, note, value }) => ({
				kind,
				note,
				value,
			})),
		});

		if (!result.success) {
			setErrors(mapValidationErrors(result.error.issues, entries));

			return;
		}

		setErrors(getInitialErrors());

		void dispatch(presetsActions.create(result.data))
			.unwrap()
			.then(() => {
				notification.success("Preset created successfully.");
			})
			.then(() => navigate(GO_BACK))
			.catch(() => null);
	}, [
		description,
		dispatch,
		entries,
		isDirty,
		instructions,
		name,
		navigate,
		selectedPreset,
	]);

	const handleCancel = useCallback((): void => {
		if (!isDirty) {
			void (async (): Promise<void> => {
				await navigate(GO_BACK);
			})();

			return;
		}

		setIsCancelDialogOpen(true);
	}, [isDirty, navigate]);

	const handleCancelDialog = useCallback((): void => {
		setIsCancelDialogOpen(false);
	}, []);

	const handleConfirmCancel = useCallback((): void => {
		setIsCancelDialogOpen(false);
		void (async (): Promise<void> => {
			await navigate(GO_BACK);
		})();
	}, [navigate]);

	const handleBackToPresets = useCallback((): void => {
		void (async (): Promise<void> => {
			await navigate(AppRoute.PRESETS);
		})();
	}, [navigate]);

	const handleBasePresetChange = useCallback(
		(event: ChangeEvent<HTMLSelectElement>): void => {
			const presetId = Number(event.target.value);

			setBasePresetId(presetId === EMPTY_LENGTH ? null : presetId);

			setErrors(getInitialErrors());
		},
		[],
	);

	const handleDescriptionChange = useCallback(
		(event: ChangeEvent<HTMLTextAreaElement>): void => {
			setDescription(event.target.value);

			setErrors((current) => ({
				...current,
				description: null,
			}));
		},
		[],
	);

	const handleNameChange = useCallback(
		(event: ChangeEvent<HTMLInputElement>): void => {
			setName(event.target.value);

			setErrors((current) => ({
				...current,
				name: null,
			}));
		},
		[],
	);

	const handleInstructionsChange = useCallback(
		(event: ChangeEvent<HTMLTextAreaElement>): void => {
			setInstructions(event.target.value);

			setErrors((current) => ({
				...current,
				instructions: null,
			}));
		},
		[],
	);

	if (isNotFound) {
		return (
			<div className="preset-editor">
				<header className="preset-editor__header">
					<h1 className="preset-editor__title">Preset not found</h1>
					<ThemeToggle />
				</header>

				<main className="preset-editor__main">
					<section className="preset-editor__error">
						<p>The requested preset does not exist.</p>

						<Button label="Back to presets" onClick={handleBackToPresets} />
					</section>
				</main>
			</div>
		);
	}

	return (
		<div className="preset-editor">
			<header className="preset-editor__header">
				<h1 className="preset-editor__title">New preset</h1>
				<ThemeToggle />
			</header>

			{isLoading ? (
				<LoaderOverlay label="Loading presets" />
			) : (
				<main className="preset-editor__main">
					<div className="preset-editor__container">
						<section className="preset-editor__card">
							<PresetBasicFields
								basePresetId={basePresetId}
								description={description}
								errors={errors}
								instructions={instructions}
								isDisabled={isFormDisabled}
								name={name}
								onBasePresetChange={handleBasePresetChange}
								onDescriptionChange={handleDescriptionChange}
								onInstructionsChange={handleInstructionsChange}
								onNameChange={handleNameChange}
								presets={presets}
							/>

							<PresetGlossary
								entries={entries}
								errors={errors.glossary}
								isDisabled={isFormDisabled}
								newEntryId={newEntryId}
								onAddEntry={handleAddEntry}
								onCloseTypeSelector={handleCloseTypeSelector}
								onKindOptionClick={handleKindOptionClick}
								onRemoveButtonClick={handleRemoveButtonClick}
								onTypeButtonClick={handleTypeButtonClick}
								onValueChange={handleGlossaryValueChange}
								openTypeId={openTypeId}
							/>

							<PresetOutputFields fields={outputFields} />

							<PresetEditorActions
								isDisabled={isFormDisabled}
								isFormChanged={isDirty}
								isSaving={isSaving}
								onCancel={handleCancel}
								onSubmit={handleSubmit}
							/>
						</section>
					</div>
				</main>
			)}
			{isDeleteDialogOpen && (
				<ConfirmDialog
					checkboxLabel="Don't show this again"
					description="Are you sure you want to delete this term?"
					isCheckboxChecked={skipDeleteConfirmation}
					onCancel={handleCancelDelete}
					onCheckboxChange={handleSkipDeleteConfirmation}
					onConfirm={handleConfirmDelete}
					title="Delete a term"
				/>
			)}
			{isCancelDialogOpen && (
				<ConfirmDialog
					confirmLabel="Yes"
					description="Your unsaved changes will be lost."
					onCancel={handleCancelDialog}
					onConfirm={handleConfirmCancel}
					title="Are you sure you want to exit?"
				/>
			)}
		</div>
	);
};

export { PresetEditor };
