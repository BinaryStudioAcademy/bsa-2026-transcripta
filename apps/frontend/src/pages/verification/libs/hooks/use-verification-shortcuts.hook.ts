import { useCallback, useState } from "~/libs/hooks/hooks.js";

const useVerificationShortcuts = () => {
	const [isShortcutsOpen, setIsShortcutsOpen] = useState(false);

	const handleToggleShortcuts = useCallback((): void => {
		setIsShortcutsOpen((value) => !value);
	}, []);

	const handleCloseShortcuts = useCallback((): void => {
		setIsShortcutsOpen(false);
	}, []);

	return {
		handleCloseShortcuts,
		handleToggleShortcuts,
		isShortcutsOpen,
	};
};

export { useVerificationShortcuts };
