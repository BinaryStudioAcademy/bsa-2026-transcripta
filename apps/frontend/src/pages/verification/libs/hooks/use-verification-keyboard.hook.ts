import { useEffect } from "~/libs/hooks/hooks.js";

type UseVerificationKeyboardProperties = {
	onConfirm: () => void;
	onSkip: () => void;
	onToggleShortcuts: () => void;
	onToggleZoom: () => void;
};

const useVerificationKeyboard = ({
	onConfirm,
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

			switch (event.key) {
				case " ": {
					event.preventDefault();
					onToggleZoom();
					break;
				}

				case "?": {
					onToggleShortcuts();
					break;
				}

				case "ArrowRight": {
					onConfirm();
					break;
				}

				case "Enter": {
					onConfirm();
					break;
				}

				case "s": {
					onSkip();
					break;
				}

				case "S": {
					onSkip();
					break;
				}
			}
		};

		globalThis.addEventListener("keyup", handleKeyUp);

		return () => {
			globalThis.removeEventListener("keyup", handleKeyUp);
		};
	}, [onConfirm, onSkip, onToggleShortcuts, onToggleZoom]);
};

export { useVerificationKeyboard };
