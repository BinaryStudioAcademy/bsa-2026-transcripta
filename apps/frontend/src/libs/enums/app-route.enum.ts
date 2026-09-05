const AppRoute = {
	DOCUMENT: "/documents/:id",
	DOCUMENTS: "/",
	DOCUMENTS_NEW: "/documents/new",
	GROUND_TRUTH: "/documents/:id/ground-truth",
	PRESETS: "/presets",
	ROOT: "/",
	SIGN_IN: "/sign-in",
	SIGN_UP: "/sign-up",
	TEST: "/test",
	VERIFICATION: "/documents/:id/verify",
} as const;

export { AppRoute };
