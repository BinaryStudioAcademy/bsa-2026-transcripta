import { z } from "zod";

import { DOCUMENT_EXPORT_FORMATS } from "../constants/constants.js";
import { DocumentExportValidationMessage } from "../enums/enums.js";

const DocumentExportCreateRequestValidationSchema = z.object({
	format: z.enum(DOCUMENT_EXPORT_FORMATS, {
		errorMap: (issue, context) => {
			if (issue.code === z.ZodIssueCode.invalid_enum_value) {
				return {
					message: DocumentExportValidationMessage.INVALID_EXPORT_FORMAT,
				};
			}
			if (issue.code === z.ZodIssueCode.invalid_type) {
				if (issue.received === z.ZodParsedType.undefined) {
					return {
						message: DocumentExportValidationMessage.EXPORT_FORMAT_REQUIRE,
					};
				}
				return {
					message: DocumentExportValidationMessage.INVALID_EXPORT_FORMAT,
				};
			}
			return { message: context.defaultError };
		},
	}),
});

export { DocumentExportCreateRequestValidationSchema };
