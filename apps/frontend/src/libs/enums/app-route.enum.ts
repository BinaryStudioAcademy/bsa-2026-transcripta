const AppRoute = {
	DOCUMENT: "/documents/:id",
	GROUND_TRUTH: "/documents/:id/ground-truth",
	ROOT: "/",
	SIGN_IN: "/sign-in",
	SIGN_UP: "/sign-up",
	TEST: "/test",
	VERIFICATION: "/documents/:id/verify",
} as const;

export { AppRoute };
