import { useEffect } from "~/libs/hooks/hooks.js";

type UseVerificationKeyboardProperties = {
	isEditing: boolean;
	isShortcutsOpen: boolean;
	onCancelEdit: () => void;
	onCloseShortcuts: () => void;
	onConfirm: () => void;
	onEdit: () => void;
	onPrevious: () => void;
	onSkip: () => void;
	onToggleShortcuts: () => void;
	onToggleZoom: () => void;
	onUndo: () => void;
};

const canHandleShortcut = (target: EventTarget | null): boolean => {
	return !(
		target instanceof HTMLInputElement ||
		target instanceof HTMLTextAreaElement ||
		target instanceof HTMLSelectElement ||
		(target instanceof HTMLElement && target.isContentEditable)
	);
};

const isUndoShortcut = (event: KeyboardEvent): boolean =>
	(event.ctrlKey || event.metaKey) &&
	!event.shiftKey &&
	!event.altKey &&
	event.code === "KeyZ";

const isSaveShortcut = (event: KeyboardEvent): boolean =>
	event.key === "Enter" &&
	(event.ctrlKey || event.metaKey) &&
	!event.altKey &&
	!event.shiftKey;

const isPageLevelShortcut = (event: KeyboardEvent): boolean => {
	if (isUndoShortcut(event)) {
		return true;
	}

	if (event.ctrlKey || event.metaKey || event.altKey) {
		return false;
	}

	return (
		event.key === "?" ||
		event.key === "ArrowLeft" ||
		event.key === "ArrowRight" ||
		event.key === "Enter" ||
		event.key === " " ||
		event.code === "KeyE" ||
		event.code === "KeyS"
	);
};

const handlePageShortcut = ({
	event,
	onConfirm,
	onEdit,
	onPrevious,
	onSkip,
	onToggleShortcuts,
	onToggleZoom,
	onUndo,
}: {
	event: KeyboardEvent;
	onConfirm: () => void;
	onEdit: () => void;
	onPrevious: () => void;
	onSkip: () => void;
	onToggleShortcuts: () => void;
	onToggleZoom: () => void;
	onUndo: () => void;
}): void => {
	if (isUndoShortcut(event)) {
		event.preventDefault();
		onUndo();
		return;
	}

	if (event.ctrlKey || event.metaKey || event.altKey) {
		return;
	}

	if (event.key === "?") {
		event.preventDefault();
		onToggleShortcuts();
		return;
	}

	if (event.key === "ArrowLeft") {
		event.preventDefault();
		onPrevious();
		return;
	}

	if (event.key === "Enter" || event.key === "ArrowRight") {
		event.preventDefault();
		onConfirm();
		return;
	}

	if (event.code === "KeyE") {
		event.preventDefault();
		onEdit();
		return;
	}

	if (event.code === "KeyS") {
		event.preventDefault();
		onSkip();
		return;
	}

	if (event.key === " ") {
		event.preventDefault();
		onToggleZoom();
	}
};

const handleShortcutsDialogKey = ({
	event,
	onCloseShortcuts,
}: {
	event: KeyboardEvent;
	onCloseShortcuts: () => void;
}): void => {
	if (event.key === "Escape") {
		event.preventDefault();
		onCloseShortcuts();
		return;
	}

	if (isSaveShortcut(event) || isPageLevelShortcut(event)) {
		event.preventDefault();
	}
};

const handleEditingShortcut = ({
	event,
	onCancelEdit,
}: {
	event: KeyboardEvent;
	onCancelEdit: () => void;
}): void => {
	if (!canHandleShortcut(event.target)) {
		return;
	}

	if (event.key === "Escape") {
		event.preventDefault();
		onCancelEdit();
		return;
	}

	if (isPageLevelShortcut(event)) {
		event.preventDefault();
	}
};

const useVerificationKeyboard = ({
	isEditing,
	isShortcutsOpen,
	onCancelEdit,
	onCloseShortcuts,
	onConfirm,
	onEdit,
	onPrevious,
	onSkip,
	onToggleShortcuts,
	onToggleZoom,
	onUndo,
}: UseVerificationKeyboardProperties): void => {
	useEffect(() => {
		const handleKeyDown = (event: KeyboardEvent): void => {
			if (event.repeat) {
				return;
			}

			if (isShortcutsOpen) {
				handleShortcutsDialogKey({ event, onCloseShortcuts });
				return;
			}

			if (isEditing) {
				handleEditingShortcut({ event, onCancelEdit });
				return;
			}

			if (!canHandleShortcut(event.target)) {
				return;
			}

			if (event.key === "Escape") {
				onCloseShortcuts();
				return;
			}

			handlePageShortcut({
				event,
				onConfirm,
				onEdit,
				onPrevious,
				onSkip,
				onToggleShortcuts,
				onToggleZoom,
				onUndo,
			});
		};

		globalThis.addEventListener("keydown", handleKeyDown, true);

		return () => {
			globalThis.removeEventListener("keydown", handleKeyDown, true);
		};
	}, [
		isEditing,
		isShortcutsOpen,
		onCancelEdit,
		onCloseShortcuts,
		onConfirm,
		onEdit,
		onPrevious,
		onSkip,
		onToggleShortcuts,
		onToggleZoom,
		onUndo,
	]);
};

export { useVerificationKeyboard };
