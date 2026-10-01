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
				if (event.key === "Escape") {
					event.preventDefault();
					onCloseShortcuts();
				}

				return;
			}

			if (isEditing) {
				if (!canHandleShortcut(event.target)) {
					return;
				}

				if (event.key === "Escape") {
					event.preventDefault();
					onCancelEdit();
				}

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
