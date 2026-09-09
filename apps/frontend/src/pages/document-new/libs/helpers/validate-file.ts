import type { FileValidationResult } from "~/libs/types/validation.types.js";

import { FIRST_INDEX } from "~/libs/constants/common.constants.js";
import { DEFAULT_FILE_REJECTION_REASON } from "~/libs/constants/file.constants.js";

import { fileValidationSchema } from "../validation-schemas/validation-schemas.js";

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
					result.error.issues[FIRST_INDEX]?.message ??
					DEFAULT_FILE_REJECTION_REASON,
			};
};

export { validateFile };
