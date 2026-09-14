import { z } from "zod";

import {
	DocumentValidationMessage,
	DocumentValidationRule,
} from "../enums/enums.js";

type DocumentUpdateBudgetRequestValidationDto = {
	limitUsd: z.ZodString;
};

const DocumentBudgetUpdateValidationSchema = z
	.object<DocumentUpdateBudgetRequestValidationDto>({
		limitUsd: z.string().trim().regex(DocumentValidationRule.LIMIT_USD_REGEX, {
			message: DocumentValidationMessage.LIMIT_USD_INVALID,
		}),
	})
	.required();

export { DocumentBudgetUpdateValidationSchema };
