const DevelopmentJwtSecretMessage = {
	PRODUCTION_ERROR:
		"JWT_SECRET cannot default to the development value in production — set JWT_SECRET in the environment.",
	WARNING:
		"JWT_SECRET is using the development fallback — set it in your .env for anything but local development.",
} as const;

export { DevelopmentJwtSecretMessage };
