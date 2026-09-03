import {
	DEFAULT_FILE_REJECTION_REASON,
	FIRST_ISSUE_INDEX,
} from "../constants/constants.js";
import { type FileValidationResult } from "../types.js";
import { fileValidationSchema } from "../validation-schemas/validation-schemas.js";

const validateFile = (file: File): FileValidationResult => {
	const result = fileValidationSchema.safeParse({
		fileBytes: file.size,
		fileName: file.name,
	});

	if (!result.success) {
		return {
			isValid: false,
			reason:
				result.error.issues[FIRST_ISSUE_INDEX]?.message ??
				DEFAULT_FILE_REJECTION_REASON,
		};
	}

	return { isValid: true };
};

export { validateFile };
