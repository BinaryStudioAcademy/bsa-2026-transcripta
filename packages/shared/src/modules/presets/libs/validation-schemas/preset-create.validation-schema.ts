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
	seedGlossary: z.ZodDefault<
		z.ZodOptional<
			z.ZodUnion<
				[
					z.ZodArray<z.ZodString>,
					z.ZodArray<z.ZodObject<typeof seedGlossaryEntrySchema.shape>>,
				]
			>
		>
	>;
	settings: z.ZodDefault<
		z.ZodOptional<z.ZodObject<typeof presetSettingsSchema.shape>>
	>;
};

const seedGlossaryEntrySchema = z.object({
	kind: z
		.string()
		.trim()
		.min(PresetValidationRule.GLOSSARY_ENTRY_MIN_LENGTH)
		.optional(),
	note: z.string().optional(),
	value: z.string().trim().min(PresetValidationRule.GLOSSARY_ENTRY_MIN_LENGTH),
});

const presetSettingsSchema = z
	.object({
		blankStdevThreshold: z.number(),
		lexiconTopK: z.number().int().nonnegative(),
		maxContextTokens: z.number().int().positive(),
		minDistinctPages: z.number().int().nonnegative(),
		model: z.string().trim().min(PresetValidationRule.MODEL_MIN_LENGTH),
		neighbourPages: z.number().int().nonnegative(),
	})
	.passthrough()
	.partial();

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
		seedGlossary: z
			.union([
				z.array(
					z.string().trim().min(PresetValidationRule.GLOSSARY_ENTRY_MIN_LENGTH),
					{
						invalid_type_error: PresetValidationMessage.SEED_GLOSSARY_INVALID,
					},
				),
				z.array(seedGlossaryEntrySchema, {
					invalid_type_error: PresetValidationMessage.SEED_GLOSSARY_INVALID,
				}),
			])
			.optional()
			.default([]),
		settings: presetSettingsSchema.optional().default({}),
	},
);

export { PresetCreateValidationSchema };
