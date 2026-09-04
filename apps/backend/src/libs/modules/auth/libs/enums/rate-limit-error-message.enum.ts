const AuthRateLimitErrorMessage = {
	TOO_MANY_REQUESTS: (time: string): string =>
		`Too many requests, please try again in ${time}.`,
} as const;

export { AuthRateLimitErrorMessage };
