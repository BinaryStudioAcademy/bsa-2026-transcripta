import React, { type ChangeEvent } from "react";

import { useCallback, useState } from "~/libs/hooks/hooks.js";

import { createEntry, isGlossaryType } from "../helpers/helpers.js";
import {
	type GlossaryEntry,
	type GlossaryType,
	type PresetFormErrors,
} from "../types/preset-editor.types.js";

type Parameters = {
	setErrors: React.Dispatch<React.SetStateAction<PresetFormErrors>>;
};

const usePresetGlossary = ({ setErrors }: Parameters) => {
	const [entries, setEntries] = useState<GlossaryEntry[]>([]);
	const [openTypeId, setOpenTypeId] = useState<null | string>(null);
	const [newEntryId, setNewEntryId] = useState<null | string>(null);
	const [entryToDelete, setEntryToDelete] = useState<null | string>(null);
	const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
	const [skipDeleteConfirmation, setSkipDeleteConfirmation] = useState(false);

	const handleAddEntry = useCallback((): void => {
		const newEntry = createEntry();

		setEntries((currentEntries) => [...currentEntries, newEntry]);
		setNewEntryId(newEntry.id);
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

			setErrors((current) => {
				const glossary = Object.fromEntries(
					Object.entries(current.glossary).filter(([key]) => key !== id),
				);

				return {
					...current,
					glossary,
				};
			});
		},
		[handleValueChange],
	);

	const handleRemoveButtonClick = useCallback(
		(event: React.MouseEvent<HTMLButtonElement>): void => {
			const { id } = event.currentTarget.dataset;

			if (!id) {
				return;
			}

			const entry = entries.find((item) => item.id === id);

			if (!entry) {
				return;
			}

			if (!entry.value.trim() || skipDeleteConfirmation) {
				handleRemoveEntry(id);

				return;
			}

			setEntryToDelete(id);
			setIsDeleteDialogOpen(true);
		},
		[entries, handleRemoveEntry, skipDeleteConfirmation],
	);

	const handleCancelDelete = useCallback((): void => {
		setIsDeleteDialogOpen(false);
		setEntryToDelete(null);
	}, []);

	const handleConfirmDelete = useCallback((): void => {
		if (!entryToDelete) {
			return;
		}

		handleRemoveEntry(entryToDelete);
		setIsDeleteDialogOpen(false);
		setEntryToDelete(null);
	}, [entryToDelete, handleRemoveEntry]);

	const handleCloseTypeSelector = useCallback((): void => {
		setOpenTypeId(null);
	}, []);

	const handleSkipDeleteConfirmation = useCallback(
		(event: React.ChangeEvent<HTMLInputElement>): void => {
			setSkipDeleteConfirmation(event.target.checked);
		},
		[],
	);

	return {
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
		setIsDeleteDialogOpen,
		setOpenTypeId,
		skipDeleteConfirmation,
	};
};

export { usePresetGlossary };
