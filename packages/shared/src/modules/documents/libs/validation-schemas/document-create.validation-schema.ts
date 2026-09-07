import { z } from "zod";

import {
	DocumentValidationMessage,
	DocumentValidationRule,
} from "../enums/enums.js";
import { sanitizeFileName } from "../helpers/sanitize-file-name.helper.js";

type DocumentCreateRequestValidationDto = {
	fileBytes: z.ZodNumber;
	fileName: z.ZodEffects<z.ZodString, string, string>;
	presetId: z.ZodNumber;
	title: z.ZodString;
};

const DocumentCreateValidationSchema = z
	.object<DocumentCreateRequestValidationDto>({
		fileBytes: z
			.number()
			.int()
			.positive()
			.max(DocumentValidationRule.MAX_FILE_BYTES, {
				message: DocumentValidationMessage.DOCUMENT_MAX_FILE_BYTES,
			}),
		fileName: z
			.string()
			.trim()
			.min(DocumentValidationRule.MIN_TITLE_LENGTH, {
				message: DocumentValidationMessage.FILE_NAME_REQUIRE,
			})
			.regex(DocumentValidationRule.PDF_FILE_REGEX, {
				message: DocumentValidationMessage.FILE_NAME_INVALID_NAME,
			})
			.transform(sanitizeFileName),
		presetId: z.number().int().positive(),
		title: z.string().trim().min(DocumentValidationRule.MIN_TITLE_LENGTH, {
			message: DocumentValidationMessage.TITLE_REQUIRE,
		}),
	})
	.required();

export { DocumentCreateValidationSchema };
