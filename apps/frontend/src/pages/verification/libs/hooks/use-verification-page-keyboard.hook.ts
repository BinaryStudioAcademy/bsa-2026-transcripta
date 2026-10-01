import { PageVerificationAction } from "~/libs/enums/enums.js";
import { useCallback } from "~/libs/hooks/hooks.js";

import { type PageVerificationActionValue } from "../types/types.js";
import { useVerificationKeyboard } from "./use-verification-keyboard.hook.js";

type UseVerificationPageKeyboardParameters = {
	isEditing: boolean;
	isShortcutsOpen: boolean;
	onCloseShortcuts: () => void;
	onEdit: () => void;
	onPrevious: () => void;
	onSetEditing: (isEditing: boolean) => void;
	onToggleShortcuts: () => void;
	onToggleZoom: () => void;
	onUndo: () => void;
	onVerify: (action: PageVerificationActionValue, text?: string) => boolean;
};

type UseVerificationPageKeyboardResult = {
	handleConfirm: () => void;
	handleSkip: () => void;
};

const useVerificationPageKeyboard = ({
	isEditing,
	isShortcutsOpen,
	onCloseShortcuts,
	onEdit,
	onPrevious,
	onSetEditing,
	onToggleShortcuts,
	onToggleZoom,
	onUndo,
	onVerify,
}: UseVerificationPageKeyboardParameters): UseVerificationPageKeyboardResult => {
	const handleConfirm = useCallback((): void => {
		onVerify(PageVerificationAction.CONFIRM);
	}, [onVerify]);

	const handleSkip = useCallback((): void => {
		onVerify(PageVerificationAction.SKIP);
	}, [onVerify]);

	useVerificationKeyboard({
		isEditing,
		isShortcutsOpen,
		onCancelEdit: () => {
			onSetEditing(false);
		},
		onCloseShortcuts,
		onConfirm: handleConfirm,
		onEdit,
		onPrevious,
		onSkip: handleSkip,
		onToggleShortcuts,
		onToggleZoom,
		onUndo,
	});

	return { handleConfirm, handleSkip };
};

export { useVerificationPageKeyboard };
