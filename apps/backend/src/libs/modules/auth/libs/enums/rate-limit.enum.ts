const AuthRateLimit = {
	MAX_ATTEMPTS: 10,
	TIME_WINDOW: "1 minute",
} as const;

export { AuthRateLimit };
