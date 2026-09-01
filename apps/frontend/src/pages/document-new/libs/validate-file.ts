import type { FileValidationResult } from "./types.js";

import {
	DocumentValidationMessage,
	MAX_FILE_BYTES,
	PDF_FILE_REGEX,
} from "./constants.js";

const validateFile = (file: File): FileValidationResult => {
	if (!PDF_FILE_REGEX.test(file.name)) {
		return {
			isValid: false,
			reason: DocumentValidationMessage.FILE_NAME_INVALID_NAME,
		};
	}

	if (file.size > MAX_FILE_BYTES) {
		return {
			isValid: false,
			reason: DocumentValidationMessage.DOCUMENT_MAX_FILE_BYTES,
		};
	}

	return { isValid: true };
};

export { validateFile };
