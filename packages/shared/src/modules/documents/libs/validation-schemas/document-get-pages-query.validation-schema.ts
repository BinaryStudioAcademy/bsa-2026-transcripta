import { z } from "zod";

import {
	DocumentValidationMessage,
	DocumentValidationRule,
} from "../enums/enums.js";

type DocumentGetPagesQueryValidationDto = {
	from: z.ZodDefault<z.ZodNumber>;
	limit: z.ZodDefault<z.ZodNumber>;
};

const DocumentGetPagesQueryValidationSchema =
	z.object<DocumentGetPagesQueryValidationDto>({
		from: z.coerce
			.number({
				invalid_type_error: DocumentValidationMessage.PAGE_FROM_POSITIVE,
			})
			.int({
				message: DocumentValidationMessage.PAGE_FROM_POSITIVE,
			})
			.min(DocumentValidationRule.PAGE_FROM_MINIMUM, {
				message: DocumentValidationMessage.PAGE_FROM_POSITIVE,
			})
			.default(DocumentValidationRule.PAGE_FROM_DEFAULT),
		limit: z.coerce
			.number({
				invalid_type_error: DocumentValidationMessage.PAGE_LIMIT_POSITIVE,
			})
			.int({
				message: DocumentValidationMessage.PAGE_LIMIT_POSITIVE,
			})
			.min(DocumentValidationRule.PAGE_LIMIT_MINIMUM, {
				message: DocumentValidationMessage.PAGE_LIMIT_POSITIVE,
			})
			.max(DocumentValidationRule.PAGE_LIMIT_MAXIMUM, {
				message: DocumentValidationMessage.PAGE_LIMIT_MAXIMUM,
			})
			.default(DocumentValidationRule.PAGE_LIMIT_DEFAULT),
	});

export { DocumentGetPagesQueryValidationSchema };
