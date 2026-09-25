import React, { type ChangeEvent } from "react";

import { ThemeToggle } from "~/libs/components/components.js";
import { EMPTY_LENGTH } from "~/libs/constants/common.constants.js";
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

import { GLOSSARY_TYPES } from "./libs/constants/preset-editor.constants.js";
import {
	createEntry,
	getOutputFields,
	isGlossaryType,
	mapSeedGlossary,
} from "./libs/helpers/helpers.js";

const handleCancel = (): void => {
	// TODO: Navigate back when routing is connected.
};

const handleSubmit = (): void => {
	// TODO: Add validation and POST /api/v1/presets
};

const PresetEditor: React.FC = () => {
	const dispatch = useAppDispatch();
	const { id } = useParams<{ id?: string }>();

	const { presets, selectedPreset, selectedPresetStatus } = useAppSelector(
		({ presets }) => ({
			presets: presets.presets,
			selectedPreset: presets.selectedPreset,
			selectedPresetStatus: presets.selectedPresetStatus,
		}),
	);

	const [basePresetId, setBasePresetId] = useState<null | number>(
		id ? Number(id) : null,
	);
	const [name, setName] = useState("");
	const [instructions, setInstructions] = useState("");
	const [entries, setEntries] = useState<GlossaryEntry[]>([]);
	const [openTypeId, setOpenTypeId] = useState<null | string>(null);

	const isPresetLoading = selectedPresetStatus === DataStatus.PENDING;

	const outputFields =
		selectedPreset && basePresetId
			? getOutputFields(selectedPreset.outputSchema)
			: [];

	useEffect(() => {
		if (presets.length === EMPTY_LENGTH) {
			void dispatch(presetsActions.loadAll());
		}
	}, [dispatch, presets.length]);

	useEffect(() => {
		if (basePresetId === null) {
			setName("");
			setInstructions("");
			setEntries([]);
			setOpenTypeId(null);
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
				<h1 className="preset-editor__title">
					{basePresetId ? "Edit preset" : "New preset"}
				</h1>

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
										id="based-on"
										onChange={handleBasePresetChange}
										value={basePresetId ?? ""}
									>
										{presets.length === EMPTY_LENGTH && (
											<option value="">Loading presets...</option>
										)}

										<option value="">None</option>

										{presets.map((preset) => (
											<option key={preset.id} value={preset.id}>
												{preset.name}
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
									disabled={isPresetLoading}
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
								disabled={isPresetLoading}
								id="instructions"
								onChange={handleInstructionsChange}
								rows={3}
								value={instructions}
							/>
						</div>

						<div className="preset-editor__section preset-editor__glossary">
							<div className="preset-editor__section-heading">
								<h2 className="preset-editor__section-title">
									Seed glossary
									<span className="preset-editor__section-subtitle">
										{" "}
										— known names and phrases to help the first pages
									</span>
								</h2>

								<button
									className="tx-btn tx-btn--secondary tx-btn--sm"
									disabled={isPresetLoading}
									onClick={handleAddEntry}
									type="button"
								>
									+ add word
								</button>
							</div>

							<div className="preset-editor__glossary-list">
								{entries.map((entry) => (
									<div className="preset-editor__glossary-row" key={entry.id}>
										<div className="preset-editor__type-selector">
											<button
												aria-expanded={openTypeId === entry.id}
												aria-haspopup="listbox"
												className="preset-editor__type-button"
												data-id={entry.id}
												onClick={handleTypeButtonClick}
												type="button"
											>
												<span>{entry.kind}</span>
												<span className="preset-editor__type-chevron">▾</span>
											</button>

											{openTypeId === entry.id && (
												<div
													aria-label="Glossary kind"
													className="preset-editor__type-menu"
													role="listbox"
												>
													{GLOSSARY_TYPES.map((kind) => (
														<button
															aria-selected={entry.kind === kind}
															className="preset-editor__type-option"
															data-id={entry.id}
															data-kind={kind}
															key={kind}
															onClick={handleKindOptionClick}
															role="option"
															type="button"
														>
															<span>{kind}</span>
															<span className="preset-editor__type-option-check">
																{entry.kind === kind ? "✓" : ""}
															</span>
														</button>
													))}
												</div>
											)}
										</div>

										<label
											className="visually-hidden"
											htmlFor={`glossary-value-${entry.id}`}
										>
											Glossary value
										</label>

										<input
											className="tx-input preset-editor__glossary-input"
											data-id={entry.id}
											id={`glossary-value-${entry.id}`}
											onChange={handleGlossaryValueChange}
											value={entry.value}
										/>

										<button
											aria-label={`Remove ${entry.value || "glossary entry"}`}
											className="preset-editor__remove-button"
											data-id={entry.id}
											onClick={handleRemoveButtonClick}
											type="button"
										>
											×
										</button>
									</div>
								))}
							</div>
						</div>

						{basePresetId && (
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
											<span className="preset-editor__output-chip">
												{field}
											</span>
											<span className="preset-editor__output-separator">·</span>
										</span>
									))}
								</div>
							</div>
						)}

						<div className="preset-editor__actions">
							<p className="preset-editor__notice">
								Saving creates a new preset version. Documents already in
								progress continue using the version they started with.
							</p>

							<div className="preset-editor__buttons">
								<button
									className="tx-btn tx-btn--ghost"
									disabled={isPresetLoading}
									onClick={handleCancel}
									type="button"
								>
									Cancel
								</button>

								<button
									className="tx-btn tx-btn--primary"
									disabled={isPresetLoading}
									onClick={handleSubmit}
									type="button"
								>
									{basePresetId ? "Save changes" : "Save preset"}
								</button>
							</div>
						</div>
					</section>
				</div>
			</main>
		</div>
	);
};

export { PresetEditor };
