import { z } from "zod";

const DocumentIdValidationSchema = z
	.object({
		id: z.coerce.number().int().positive(),
	})
	.required();

export { DocumentIdValidationSchema };
