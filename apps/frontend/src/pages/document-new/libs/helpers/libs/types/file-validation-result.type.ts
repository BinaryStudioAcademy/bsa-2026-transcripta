type FileValidationResult =
	| { isValid: false; reason: string }
	| { isValid: true };

export { type FileValidationResult };
