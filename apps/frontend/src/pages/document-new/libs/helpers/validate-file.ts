import { fileValidationSchema } from "../validation-schemas/validation-schemas.js";
import {
	DEFAULT_FILE_REJECTION_REASON,
	FIRST_ISSUE_INDEX,
} from "./libs/constants/constants.js";
import { type FileValidationResult } from "./libs/types/types.js";

const FILE_NAME_FIELD = "fileName";
const FIRST_PATH_INDEX = 0;

type ValidationIssue = {
	message: string;
	path: (number | string)[];
};

const resolveRejection = (
	issues: readonly ValidationIssue[],
): null | string => {
	const typeIssue = issues.find((issue) => {
		return issue.path[FIRST_PATH_INDEX] === FILE_NAME_FIELD;
	});

	if (typeIssue) {
		return typeIssue.message;
	}

	return issues[FIRST_ISSUE_INDEX]?.message ?? null;
};

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
					resolveRejection(result.error.issues) ??
					DEFAULT_FILE_REJECTION_REASON,
			};
};

export { validateFile };
