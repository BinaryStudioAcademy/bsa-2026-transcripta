import { z } from "zod";

import {
	PresetValidationMessage,
	PresetValidationRule,
} from "../enums/enums.js";

type PresetCreateRequestValidationDto = {
	description: z.ZodDefault<z.ZodOptional<z.ZodString>>;
	familyId: z.ZodNumber;
	instructions: z.ZodString;
	name: z.ZodString;
	seedGlossary: z.ZodDefault<z.ZodOptional<z.ZodArray<z.ZodUnknown>>>;
	settings: z.ZodDefault<z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>>;
};

const PresetCreateValidationSchema = z.object<PresetCreateRequestValidationDto>(
	{
		description: z
			.string()
			.trim()
			.max(PresetValidationRule.DESCRIPTION_MAX_LENGTH, {
				message: PresetValidationMessage.DESCRIPTION_MAX_LENGTH,
			})
			.optional()
			.default(""),
		familyId: z
			.number()
			.int()
			.positive({ message: PresetValidationMessage.FAMILY_ID_REQUIRE }),
		instructions: z
			.string()
			.trim()
			.min(PresetValidationRule.INSTRUCTIONS_MIN_LENGTH, {
				message: PresetValidationMessage.INSTRUCTIONS_REQUIRE,
			}),
		name: z
			.string()
			.trim()
			.min(PresetValidationRule.NAME_MIN_LENGTH, {
				message: PresetValidationMessage.NAME_REQUIRE,
			})
			.max(PresetValidationRule.NAME_MAX_LENGTH, {
				message: PresetValidationMessage.NAME_MAX_LENGTH,
			}),
		seedGlossary: z.array(z.unknown()).optional().default([]),
		settings: z.record(z.string(), z.unknown()).optional().default({}),
	},
);

export { PresetCreateValidationSchema };
