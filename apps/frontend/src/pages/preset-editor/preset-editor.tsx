import React, { type ChangeEvent } from "react";

import { LoaderOverlay, ThemeToggle } from "~/libs/components/components.js";
import {
	EMPTY_LENGTH,
	FIRST_INDEX,
	GO_BACK,
} from "~/libs/constants/constants.js";
import { DataStatus } from "~/libs/enums/enums.js";
import {
	useAppDispatch,
	useAppSelector,
	useCallback,
	useEffect,
	useNavigate,
	useParams,
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

	const initialPresetId = id ? Number(id) : null;

	const [basePresetId, setBasePresetId] = useState<null | number>(
		initialPresetId && Number.isFinite(initialPresetId)
			? initialPresetId
			: null,
	);
	const [name, setName] = useState("");
	const [instructions, setInstructions] = useState("");
	const [entries, setEntries] = useState<GlossaryEntry[]>([]);
	const [openTypeId, setOpenTypeId] = useState<null | string>(null);

	const isLoading =
		selectedPresetStatus === DataStatus.PENDING ||
		presetsStatus === DataStatus.PENDING;
	const isSaving = createStatus === DataStatus.PENDING;
	const isFormDisabled = isLoading || isSaving || !selectedPreset;

	const outputFields =
		selectedPreset && basePresetId
			? getOutputFields(selectedPreset.outputSchema)
			: [];

	useEffect(() => {
		if (basePresetId === null && presets.length !== EMPTY_LENGTH) {
			const firstPreset = presets[FIRST_INDEX];

			if (!firstPreset) {
				return;
			}

			setBasePresetId(firstPreset.id);
		}
	}, [basePresetId, presets]);

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

		setName(selectedPreset.name);
		setInstructions(selectedPreset.instructions);
		setEntries(mapSeedGlossary(selectedPreset.seedGlossary));
		setOpenTypeId(null);
	}, [selectedPreset, basePresetId]);

	const handleSubmit = useCallback((): void => {
		if (!selectedPreset) {
			return;
		}

		const result = PresetCreateValidationSchema.safeParse({
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
	}, [dispatch, entries, instructions, name, navigate, selectedPreset]);

	const handleCancel = useCallback((): void => {
		void (async (): Promise<void> => {
			await navigate(GO_BACK);
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
								instructions={instructions}
								isDisabled={isFormDisabled}
								name={name}
								onBasePresetChange={handleBasePresetChange}
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
