import { z } from "zod";

import {
	DocumentExportValidationMessage,
	DocumentExportValidationRule,
} from "../enums/enums.js";

type DocumentExportGetByIdParametersValidationDto = {
	id: z.ZodNumber;
};

const DocumentExportGetByIdParametersValidationSchema = z
	.object<DocumentExportGetByIdParametersValidationDto>({
		id: z.coerce
			.number({
				invalid_type_error:
					DocumentExportValidationMessage.DOCUMENT_EXPORT_ID_POSITIVE,
			})
			.int({
				message: DocumentExportValidationMessage.DOCUMENT_EXPORT_ID_POSITIVE,
			})
			.min(DocumentExportValidationRule.ID_MINIMUM, {
				message: DocumentExportValidationMessage.DOCUMENT_EXPORT_ID_POSITIVE,
			}),
	})
	.required();

export { DocumentExportGetByIdParametersValidationSchema };
