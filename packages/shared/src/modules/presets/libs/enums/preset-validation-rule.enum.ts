const PresetValidationRule = {
	DESCRIPTION_MAX_LENGTH: 2000,
	ID_MINIMUM: 1,
	INSTRUCTIONS_MIN_LENGTH: 1,
	NAME_MAX_LENGTH: 255,
	NAME_MIN_LENGTH: 1,
} as const;

export { PresetValidationRule };
