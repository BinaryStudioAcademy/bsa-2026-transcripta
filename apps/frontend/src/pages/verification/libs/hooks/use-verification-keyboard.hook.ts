import { useEffect } from "~/libs/hooks/hooks.js";

type UseVerificationKeyboardProperties = {
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
				!event.altKey &&
				(event.key === "z" || event.key === "Z");

			if (isUndoShortcut) {
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

			if (event.key === "e" || event.key === "E") {
				event.preventDefault();
				onEdit();

				return;
			}

			if (event.key === "s" || event.key === "S") {
				event.preventDefault();
				onSkip();

				return;
			}

			if (event.key === " ") {
				event.preventDefault();
				onToggleZoom();
			}
		};

		globalThis.addEventListener("keydown", handleKeyDown, true);

		return () => {
			globalThis.removeEventListener("keydown", handleKeyDown, true);
		};
	}, [
		onConfirm,
		onEdit,
		onSkip,
		onPrevious,
		onToggleShortcuts,
		onToggleZoom,
		onUndo,
	]);
};

export { useVerificationKeyboard };
