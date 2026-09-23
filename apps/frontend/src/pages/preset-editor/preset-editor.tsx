import { FIRST_INDEX } from "~/libs/constants/common.constants.js";

import "./preset-editor.css";

import { useCallback, useState } from "~/libs/hooks/hooks.js";

import type {
	GlossaryEntry,
	GlossaryType,
} from "./libs/types/preset-editor.types.js";

import {
	BASE_PRESETS,
	GLOSSARY_TYPES,
	INITIAL_ENTRIES,
	OUTPUT_FIELDS,
} from "./libs/constants/preset-editor.constants.js";

const createEntry = (): GlossaryEntry => ({
	id: crypto.randomUUID(),
	kind: "term",
	value: "",
});

const handleCancel = (): void => {
	// TODO: Navigate back when routing is connected.
};

const handleSubmit = (): void => {
	// TODO: Add validation and POST /api/v1/presets
};

const PresetEditor: React.FC = () => {
	const [basePresetId, setBasePresetId] = useState(
		BASE_PRESETS[FIRST_INDEX]?.id,
	);
	const [name, setName] = useState("Dykanka, 1880s");
	const [description, setDescription] = useState(
		"Transcription preset for historical parish registers.",
	);
	const [instructions, setInstructions] = useState(
		"This is a page from a late 19th-century parish register. Cursive, faded ink. Preserve the original spelling — do not modernise it.",
	);
	const [entries, setEntries] = useState<GlossaryEntry[]>(
		INITIAL_ENTRIES.map((entry) => ({
			id: crypto.randomUUID(),
			kind: entry.kind,
			value: entry.value,
		})),
	);
	const [openTypeId, setOpenTypeId] = useState<null | string>(null);

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
		(event: React.ChangeEvent<HTMLSelectElement>): void => {
			setBasePresetId(event.target.value);
		},
		[],
	);

	const handleNameChange = useCallback(
		(event: React.ChangeEvent<HTMLInputElement>): void => {
			setName(event.target.value);
		},
		[],
	);

	const handleDescriptionChange = useCallback(
		(event: React.ChangeEvent<HTMLInputElement>): void => {
			setDescription(event.target.value);
		},
		[],
	);

	const handleInstructionsChange = useCallback(
		(event: React.ChangeEvent<HTMLTextAreaElement>): void => {
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

			if (!id || !kind) {
				return;
			}

			handleKindChange(id, kind as GlossaryType);
			setOpenTypeId(null);
		},
		[handleKindChange],
	);

	const handleGlossaryValueChange = useCallback(
		(event: React.ChangeEvent<HTMLInputElement>): void => {
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

				<button className="tx-btn tx-btn--ghost tx-btn--sm" type="button">
					Night
				</button>
			</header>

			<main className="preset-editor__main">
				<div className="preset-editor__container">
					<section className="preset-editor__card">
						<div className="preset-editor__basic-fields">
							<div className="preset-editor__field">
								<label className="tx-label" htmlFor="based-on">
									Based on
								</label>

								<select
									className="tx-input"
									id="based-on"
									onChange={handleBasePresetChange}
									value={basePresetId}
								>
									{BASE_PRESETS.map((preset) => (
										<option key={preset.id} value={preset.id}>
											{preset.name}
										</option>
									))}
								</select>
							</div>

							<div className="preset-editor__field">
								<label className="tx-label" htmlFor="preset-name">
									Name
								</label>

								<input
									className="tx-input"
									id="preset-name"
									onChange={handleNameChange}
									value={name}
								/>
							</div>

							<div className="preset-editor__field">
								<label className="tx-label" htmlFor="preset-description">
									Description
								</label>

								<input
									className="tx-input"
									id="preset-description"
									onChange={handleDescriptionChange}
									value={description}
								/>
							</div>
						</div>

						<div className="preset-editor__section">
							<label className="tx-label" htmlFor="instructions">
								Instructions for the model
							</label>

							<textarea
								className="tx-input preset-editor__instructions"
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
										— known names and phrases to help the first pages
									</span>
								</h2>

								<button
									className="tx-btn tx-btn--secondary tx-btn--sm"
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
															<span>{entry.kind === kind ? "✓" : ""}</span>
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
											className="preset-editor__glossary-input"
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
								{OUTPUT_FIELDS.map((field) => (
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
								<button
									className="tx-btn tx-btn--ghost"
									onClick={handleCancel}
									type="button"
								>
									Cancel
								</button>

								<button
									className="tx-btn tx-btn--primary"
									onClick={handleSubmit}
									type="button"
								>
									Save preset
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
