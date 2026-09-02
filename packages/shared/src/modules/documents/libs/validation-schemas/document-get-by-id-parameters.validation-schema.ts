import { z } from "zod";

import {
	DocumentValidationMessage,
	DocumentValidationRule,
} from "../enums/enums.js";

type DocumentGetByIdParametersValidationDto = {
	id: z.ZodNumber;
};

const DocumentGetByIdParametersValidationSchema = z
	.object<DocumentGetByIdParametersValidationDto>({
		id: z.coerce
			.number({
				invalid_type_error: DocumentValidationMessage.DOCUMENT_ID_POSITIVE,
			})
			.int({
				message: DocumentValidationMessage.DOCUMENT_ID_POSITIVE,
			})
			.min(DocumentValidationRule.ID_MINIMUM, {
				message: DocumentValidationMessage.DOCUMENT_ID_POSITIVE,
			}),
	})
	.required();

export { DocumentGetByIdParametersValidationSchema };
