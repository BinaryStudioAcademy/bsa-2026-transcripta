import React, { type ChangeEvent } from "react";

import { Button, ThemeToggle } from "~/libs/components/components.js";
import {
	EMPTY_LENGTH,
	FIRST_INDEX,
} from "~/libs/constants/common.constants.js";
import { DataStatus } from "~/libs/enums/enums.js";
import {
	useAppDispatch,
	useAppSelector,
	useCallback,
	useEffect,
	useParams,
	useState,
} from "~/libs/hooks/hooks.js";

import "./preset-editor.css";

import { actions as presetsActions } from "~/modules/presets/presets.js";

import type {
	GlossaryEntry,
	GlossaryType,
} from "./libs/types/preset-editor.types.js";

import { PresetGlossary } from "./libs/components/preset-glossary.js";
import {
	createEntry,
	getOutputFields,
	isGlossaryType,
	mapSeedGlossary,
} from "./libs/helpers/helpers.js";

const handleCancel = (): void => {
	// TODO: Navigate back when routing is connected.
};

const PresetEditor: React.FC = () => {
	const dispatch = useAppDispatch();
	const { id } = useParams<{ id?: string }>();

	const { createStatus, presets, selectedPreset, selectedPresetStatus } =
		useAppSelector(({ presets }) => ({
			createStatus: presets.createStatus,
			presets: presets.presets,
			selectedPreset: presets.selectedPreset,
			selectedPresetStatus: presets.selectedPresetStatus,
		}));

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

	const isPresetLoading = selectedPresetStatus === DataStatus.PENDING;
	const isSaving = createStatus === DataStatus.PENDING;
	const isFormDisabled = isPresetLoading || isSaving;

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

		setOpenTypeId(null);

		const trimmedName = name.trim();
		const trimmedInstructions = instructions.trim();

		if (!trimmedName || !trimmedInstructions) {
			return;
		}

		void dispatch(
			presetsActions.create({
				familyId: selectedPreset.familyId,
				instructions: trimmedInstructions,
				name: trimmedName,
				seedGlossary: entries
					.filter(({ value }) => value.trim())
					.map(({ kind, value }) => ({
						kind,
						value: value.trim(),
					})),
			}),
		);
	}, [dispatch, entries, instructions, name, selectedPreset]);
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

			<main className="preset-editor__main">
				<div className="preset-editor__container">
					<section className="preset-editor__card">
						<div className="preset-editor__basic-fields">
							<div className="preset-editor__field">
								<label className="tx-label" htmlFor="based-on">
									Based on
								</label>

								<div className="tx-selectwrap">
									<select
										className="tx-input"
										disabled={presets.length === EMPTY_LENGTH || isFormDisabled}
										id="based-on"
										onChange={handleBasePresetChange}
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
									disabled={isFormDisabled}
									id="preset-name"
									onChange={handleNameChange}
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
								disabled={isFormDisabled}
								id="instructions"
								onChange={handleInstructionsChange}
								rows={3}
								value={instructions}
							/>
						</div>

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

						<div className="preset-editor__output-section">
							<div className="preset-editor__output-heading">
								<svg
									aria-hidden="true"
									fill="none"
									height="13"
									stroke="currentColor"
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth="2"
									viewBox="0 0 24 24"
									width="13"
								>
									<rect height="11" rx="2" width="18" x="3" y="11" />
									<path d="M7 11V7a5 5 0 0 1 10 0v4" />
								</svg>

								<span className="tx-label">
									Output fields (from the template, not editable)
								</span>
							</div>

							<div className="preset-editor__output-fields">
								{outputFields.map((field) => (
									<span className="preset-editor__output-item" key={field}>
										<span className="preset-editor__output-chip">{field}</span>
										<span className="preset-editor__output-separator">·</span>
									</span>
								))}
							</div>
						</div>

						<div className="preset-editor__actions">
							<p className="preset-editor__notice">
								Saving creates a new preset version. Documents already in
								progress continue using the version they started with.
							</p>

							<div className="preset-editor__buttons">
								<Button
									isDisabled={isFormDisabled}
									label="Cancel"
									onClick={handleCancel}
								/>

								<Button
									isDisabled={isFormDisabled}
									isPrimary
									label={isSaving ? "Saving..." : "Save preset"}
									onClick={handleSubmit}
								/>
							</div>
						</div>
					</section>
				</div>
			</main>
		</div>
	);
};

export { PresetEditor };
