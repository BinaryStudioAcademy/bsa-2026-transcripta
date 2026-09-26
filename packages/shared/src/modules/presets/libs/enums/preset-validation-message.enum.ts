const PresetValidationMessage = {
	PRESET_ID_POSITIVE: "Preset id must be a positive integer",
	PRESET_NOT_FOUND: "Preset not found.",
	DESCRIPTION_MAX_LENGTH: "Description must not exceed 2000 characters.",
	FAMILY_ID_REQUIRE: "Family id must be a positive integer.",
	INSTRUCTIONS_REQUIRE: "Instructions are required.",
	NAME_MAX_LENGTH: "Name must not exceed 255 characters.",
	NAME_REQUIRE: "Name is required.",
	SEED_GLOSSARY_INVALID:
		"Seed glossary must be an array of non-empty strings or objects with a non-empty value.",
} as const;

export { PresetValidationMessage };
