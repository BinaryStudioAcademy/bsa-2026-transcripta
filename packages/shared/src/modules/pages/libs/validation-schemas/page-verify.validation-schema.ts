import { z } from "zod";

import { PageVerificationAction } from "../enums/enums.js";

type VerifyPageRequestValidationDto = {
	action: z.ZodEnum<
		[
			typeof PageVerificationAction.CONFIRM,
			typeof PageVerificationAction.CORRECT,
			typeof PageVerificationAction.SKIP,
		]
	>;
	durationMs: z.ZodNumber;
	text: z.ZodString;
	transcriptionId: z.ZodNumber;
};

const verifyPage = z
	.object<VerifyPageRequestValidationDto>({
		action: z.enum([
			PageVerificationAction.CONFIRM,
			PageVerificationAction.CORRECT,
			PageVerificationAction.SKIP,
		]),
		durationMs: z.number().int().nonnegative(),
		text: z.string(),
		transcriptionId: z.number().int().positive(),
	})
	.required();

export { verifyPage };
