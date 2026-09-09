import { FILE_NAME_FIELD } from "~/libs/constants/file.constants.js";
import type { ValidationIssue } from "~/libs/types/validation.types.js";

const validateFile = (
	file: File,
	allowedTypes: string[],
	maxSizeBytes: number,
): ValidationIssue[] => {
	const issues: ValidationIssue[] = [];

	if (!allowedTypes.includes(file.type)) {
		issues.push({
			message: `File type "${file.type}" is not allowed. Allowed: ${allowedTypes.join(", ")}`,
			path: [FILE_NAME_FIELD],
		});
	}

	if (file.size > maxSizeBytes) {
		const maxSizeMB = maxSizeBytes / (1024 * 1024);
		issues.push({
			message: `File size exceeds ${maxSizeMB} MB limit.`,
			path: [FILE_NAME_FIELD],
		});
	}

	return issues;
};

export { validateFile };