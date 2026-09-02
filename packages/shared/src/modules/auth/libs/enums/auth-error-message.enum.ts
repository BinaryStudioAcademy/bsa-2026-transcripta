const AuthErrorMessage = {
	TOO_MANY_REQUESTS: (after: string): string =>
		`Too many requests, please try again in ${after}.`,
} as const;

export { AuthErrorMessage };
