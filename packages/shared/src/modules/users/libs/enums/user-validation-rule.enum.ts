const UserValidationRule = {
	EMAIL_MAXIMUM_LENGTH: 254,
	EMAIL_MINIMUM_LENGTH: 1,
	PASSWORD_MAXIMUM_LENGTH: 128,
	PASSWORD_MINIMUM_LENGTH: 8,
} as const;

export { UserValidationRule };
