import { z } from "zod";

import { LexiconValidationRule } from "../enums/enums.js";

const LexiconInvalidateValidationSchema = z.object({
	reason: z.string().trim().min(LexiconValidationRule.REASON_MINIMUM_LENGTH),
});

export { LexiconInvalidateValidationSchema };
