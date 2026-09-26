import { z } from "zod";

import { PageVerificationAction } from "../enums/enums.js";

const pageVerificationActionSchema = z.enum([
	PageVerificationAction.CONFIRM,
	PageVerificationAction.CORRECT,
	PageVerificationAction.SKIP,
]);

type VerifyPageRequestValidationDto = {
	action: typeof pageVerificationActionSchema;
	durationMs: z.ZodNumber;
	text: z.ZodOptional<z.ZodString>;
	transcriptionId: z.ZodOptional<z.ZodNumber>;
};

const verifyPage = z.object<VerifyPageRequestValidationDto>({
	action: pageVerificationActionSchema,
	durationMs: z.number().int().nonnegative(),
	text: z.string().optional(),
	transcriptionId: z.number().int().positive().optional(),
});

export { verifyPage };
