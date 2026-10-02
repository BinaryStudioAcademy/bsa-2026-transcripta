const VerificationShortcutKey = {
	ARROW_LEFT: "ArrowLeft",
	ARROW_RIGHT: "ArrowRight",
	ENTER: "Enter",
	ESCAPE: "Escape",
	QUESTION: "?",
	SPACE: " ",
} as const;

const VerificationShortcutCode = {
	EDIT: "KeyE",
	SKIP: "KeyS",
	UNDO: "KeyZ",
} as const;

export { VerificationShortcutCode, VerificationShortcutKey };
