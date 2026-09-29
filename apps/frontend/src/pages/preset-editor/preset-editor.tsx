import React, { type ChangeEvent } from "react";

import {
	Button,
	LoaderOverlay,
	ThemeToggle,
} from "~/libs/components/components.js";
import {
	EMPTY_LENGTH,
	FIRST_INDEX,
	GO_BACK,
} from "~/libs/constants/constants.js";
import { AppRoute, DataStatus } from "~/libs/enums/enums.js";
import {
	useAppDispatch,
	useAppSelector,
	useCallback,
	useEffect,
	useNavigate,
	useParams,
	useRef,
	useState,
} from "~/libs/hooks/hooks.js";

import "./preset-editor.css";

import { notification } from "~/libs/modules/notification/notification.js";
import {
	actions as presetsActions,
	selectCreateStatus,
	selectPresets,
	selectPresetsStatus,
	selectSelectedPreset,
	selectSelectedPresetStatus,
} from "~/modules/presets/presets.js";

import type {
	GlossaryEntry,
	GlossaryType,
	PresetFormState,
} from "./libs/types/preset-editor.types.js";

import {
	PresetBasicFields,
	PresetEditorActions,
	PresetGlossary,
	PresetOutputFields,
} from "./libs/components/components.js";
import {
	createEntry,
	getOutputFields,
	isGlossaryType,
	isPresetFormDirty,
	mapSeedGlossary,
} from "./libs/helpers/helpers.js";
import { PresetCreateValidationSchema } from "./libs/validation-schemas/validation-schemas.js";

const PresetEditor: React.FC = () => {
	const dispatch = useAppDispatch();
	const navigate = useNavigate();
	const { id } = useParams<{ id?: string }>();

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
	const [entries, setEntries] = useState<GlossaryEntry[]>([]);
	const [openTypeId, setOpenTypeId] = useState<null | string>(null);
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
	const initialStateInitialized = useRef(false);

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

		if (!initialStateInitialized.current) {
			setInitialFormState({
				basePresetId,
				description: selectedPreset.description,
				entries: initialEntries,
				instructions: selectedPreset.instructions,
				name: selectedPreset.name,
			});

			initialStateInitialized.current = true;
		}
	}, [selectedPreset, basePresetId]);

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
			const [firstError] = result.error.issues;

			notification.error(firstError?.message ?? "Invalid preset data");

			return;
		}

		void dispatch(presetsActions.create(result.data))
			.unwrap()
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
		void (async (): Promise<void> => {
			await navigate(GO_BACK);
		})();
	}, [navigate]);

	const handleBackToPresets = useCallback((): void => {
		void (async (): Promise<void> => {
			await navigate(AppRoute.PRESETS);
		})();
	}, [navigate]);

	const handleAddEntry = useCallback((): void => {
		setEntries((currentEntries) => [...currentEntries, createEntry()]);
	}, []);

	const handleRemoveEntry = useCallback((id: string): void => {
		setEntries((currentEntries) =>
			currentEntries.filter((entry) => entry.id !== id),
		);
	}, []);

	const handleKindChange = useCallback(
		(id: string, kind: GlossaryType): void => {
			setEntries((currentEntries) =>
				currentEntries.map((entry) =>
					entry.id === id ? { ...entry, kind } : entry,
				),
			);
		},
		[],
	);

	const handleValueChange = useCallback((id: string, value: string): void => {
		setEntries((currentEntries) =>
			currentEntries.map((entry) =>
				entry.id === id ? { ...entry, value } : entry,
			),
		);
	}, []);

	const handleBasePresetChange = useCallback(
		(event: ChangeEvent<HTMLSelectElement>): void => {
			const presetId = Number(event.target.value);

			setBasePresetId(presetId === EMPTY_LENGTH ? null : presetId);
		},
		[],
	);

	const handleDescriptionChange = useCallback(
		(event: ChangeEvent<HTMLInputElement>): void => {
			setDescription(event.target.value);
		},
		[],
	);

	const handleNameChange = useCallback(
		(event: ChangeEvent<HTMLInputElement>): void => {
			setName(event.target.value);
		},
		[],
	);

	const handleInstructionsChange = useCallback(
		(event: ChangeEvent<HTMLTextAreaElement>): void => {
			setInstructions(event.target.value);
		},
		[],
	);

	const handleTypeButtonClick = useCallback(
		(event: React.MouseEvent<HTMLButtonElement>): void => {
			const { id } = event.currentTarget.dataset;

			if (!id) {
				return;
			}

			setOpenTypeId((currentId) => (currentId === id ? null : id));
		},
		[],
	);

	const handleKindOptionClick = useCallback(
		(event: React.MouseEvent<HTMLButtonElement>): void => {
			const { id, kind } = event.currentTarget.dataset;

			if (!id || !kind || !isGlossaryType(kind)) {
				return;
			}

			handleKindChange(id, kind);
			setOpenTypeId(null);
		},
		[handleKindChange],
	);

	const handleGlossaryValueChange = useCallback(
		(event: ChangeEvent<HTMLInputElement>): void => {
			const { id } = event.currentTarget.dataset;

			if (!id) {
				return;
			}

			handleValueChange(id, event.target.value);
		},
		[handleValueChange],
	);

	const handleRemoveButtonClick = useCallback(
		(event: React.MouseEvent<HTMLButtonElement>): void => {
			const { id } = event.currentTarget.dataset;

			if (!id) {
				return;
			}

			handleRemoveEntry(id);
		},
		[handleRemoveEntry],
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
								isDisabled={isFormDisabled}
								onAddEntry={handleAddEntry}
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
		</div>
	);
};

export { PresetEditor };
