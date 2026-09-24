const PresetValidationMessage = {
	DESCRIPTION_MAX_LENGTH: "Description must not exceed 2000 characters.",
	FAMILY_ID_REQUIRE: "Family id must be a positive integer.",
	INSTRUCTIONS_REQUIRE: "Instructions are required.",
	NAME_MAX_LENGTH: "Name must not exceed 255 characters.",
	NAME_REQUIRE: "Name is required.",
	PRESET_NOT_FOUND: "Preset not found.",
} as const;

export { PresetValidationMessage };
