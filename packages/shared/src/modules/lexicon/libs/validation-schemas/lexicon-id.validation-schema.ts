import { z } from "zod";

const LexiconIdValidationSchema = z.object({
	id: z.coerce.number().int().positive(),
});

export { LexiconIdValidationSchema };
