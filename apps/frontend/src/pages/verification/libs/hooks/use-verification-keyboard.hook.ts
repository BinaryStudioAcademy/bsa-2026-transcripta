import { useEffect } from "~/libs/hooks/hooks.js";

type UseVerificationKeyboardProperties = {
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

const useVerificationKeyboard = ({
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
			if (!canHandleShortcut(event.target)) {
				return;
			}

			if (event.repeat) {
				return;
			}

			const isUndoShortcut =
				(event.ctrlKey || event.metaKey) &&
				!event.shiftKey &&
				!event.altKey &&
				event.code === "KeyZ";

			if (isUndoShortcut) {
				event.preventDefault();
				onUndo();
			}
		};

		const handleKeyUp = (event: KeyboardEvent): void => {
			if (!canHandleShortcut(event.target)) {
				return;
			}

			if (event.key === "Escape") {
				onCloseShortcuts();
				return;
			}

			if (event.ctrlKey || event.metaKey || event.altKey) {
				return;
			}

			if (event.key === "?") {
				onToggleShortcuts();
				return;
			}

			if (event.key === "ArrowLeft") {
				onPrevious();
				return;
			}

			if (event.key === "Enter" || event.key === "ArrowRight") {
				onConfirm();
				return;
			}

			if (event.code === "KeyE") {
				onEdit();
				return;
			}

			if (event.code === "KeyS") {
				onSkip();
				return;
			}

			if (event.key === " ") {
				event.preventDefault();
				onToggleZoom();
			}
		};

		globalThis.addEventListener("keydown", handleKeyDown);
		globalThis.addEventListener("keyup", handleKeyUp);

		return () => {
			globalThis.removeEventListener("keydown", handleKeyDown);
			globalThis.removeEventListener("keyup", handleKeyUp);
		};
	}, [
		onConfirm,
		onEdit,
		onSkip,
		onPrevious,
		onCloseShortcuts,
		onToggleShortcuts,
		onToggleZoom,
		onUndo,
	]);
};

export { useVerificationKeyboard };
