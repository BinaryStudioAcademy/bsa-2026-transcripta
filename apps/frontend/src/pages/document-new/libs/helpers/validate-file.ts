import { fileValidationSchema } from "../validation-schemas/validation-schemas.js";
import {
	DEFAULT_FILE_REJECTION_REASON,
	FIRST_ISSUE_INDEX,
} from "./libs/constants/constants.js";
import { type FileValidationResult } from "./libs/types/types.js";

const validateFile = (file: File): FileValidationResult => {
	const result = fileValidationSchema.safeParse({
		fileBytes: file.size,
		fileName: file.name,
	});

	return result.success
		? { isValid: true }
		: {
				isValid: false,
				reason:
					result.error.issues[FIRST_ISSUE_INDEX]?.message ??
					DEFAULT_FILE_REJECTION_REASON,
			};
};

export { validateFile };
