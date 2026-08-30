import { z } from "zod";

import {
	DocumentValidationMessage,
	DocumentValidationRule,
} from "../enums/enums.js";

type DocumentCreateRequestValidationDto = {
	fileBytes: z.ZodNumber;
	fileName: z.ZodString;
	presetId: z.ZodNumber;
	title: z.ZodString;
};

const DocumentCreateValidationSchema = z
	.object<DocumentCreateRequestValidationDto>({
		fileBytes: z.number().int().positive(),
		fileName: z.string().trim().min(DocumentValidationRule.MIN_TITLE_LENGTH, {
			message: DocumentValidationMessage.FILE_NAME_REQUIRE,
		}),
		presetId: z.number().int().positive(),
		title: z.string().trim().min(DocumentValidationRule.MIN_TITLE_LENGTH, {
			message: DocumentValidationMessage.TITLE_REQUIRE,
		}),
	})
	.required();

export { DocumentCreateValidationSchema };
