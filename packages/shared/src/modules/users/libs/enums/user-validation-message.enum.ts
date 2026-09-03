const UserValidationMessage = {
	EMAIL_MAXIMUM_LENGTH: "Email must be at most 254 characters.",
	EMAIL_REQUIRE: "Email is required",
	EMAIL_WRONG: "Email is invalid",
	PASSWORD_MINIMUM_LENGTH: "Password must be at least 8 characters",
	PASSWORD_REQUIRE: "Password is required",
} as const;

export { UserValidationMessage };
