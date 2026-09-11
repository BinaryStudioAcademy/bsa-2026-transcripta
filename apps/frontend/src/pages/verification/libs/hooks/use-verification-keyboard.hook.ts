import { useEffect } from "~/libs/hooks/hooks.js";

type UseVerificationKeyboardProperties = {
	onConfirm: () => void;
	onEdit: () => void;
	onSkip: () => void;
	onToggleShortcuts: () => void;
	onToggleZoom: () => void;
};

const useVerificationKeyboard = ({
	onConfirm,
	onEdit,
	onSkip,
	onToggleShortcuts,
	onToggleZoom,
}: UseVerificationKeyboardProperties): void => {
	useEffect(() => {
		const handleKeyUp = (event: KeyboardEvent): void => {
			const target = event.target;

			if (
				target instanceof HTMLInputElement ||
				target instanceof HTMLTextAreaElement ||
				target instanceof HTMLSelectElement ||
				(target instanceof HTMLElement && target.isContentEditable)
			) {
				return;
			}

			if (event.ctrlKey || event.metaKey || event.altKey) {
				return;
			}

			if (event.key === "?") {
				onToggleShortcuts();
				return;
			}

			if (event.key === "Enter" || event.key === "ArrowRight") {
				onConfirm();
				return;
			}

			if (event.key === "e" || event.key === "E") {
				onEdit();
				return;
			}

			if (event.key === "s" || event.key === "S") {
				onSkip();
				return;
			}

			if (event.key === " ") {
				event.preventDefault();
				onToggleZoom();
			}
		};

		globalThis.addEventListener("keyup", handleKeyUp);

		return () => {
			globalThis.removeEventListener("keyup", handleKeyUp);
		};
	}, [onConfirm, onSkip, onToggleShortcuts, onToggleZoom]);
};

export { useVerificationKeyboard };
