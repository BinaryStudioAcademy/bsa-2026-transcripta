import { z } from "zod";

import {
	PresetValidationMessage,
	PresetValidationRule,
} from "../enums/enums.js";

type PresetGetByIdParametersValidationDto = {
	id: z.ZodNumber;
};

const PresetGetByIdParametersValidationSchema = z
	.object<PresetGetByIdParametersValidationDto>({
		id: z.coerce
			.number({
				invalid_type_error: PresetValidationMessage.PRESET_ID_POSITIVE,
			})
			.int({
				message: PresetValidationMessage.PRESET_ID_POSITIVE,
			})
			.min(PresetValidationRule.ID_MINIMUM, {
				message: PresetValidationMessage.PRESET_ID_POSITIVE,
			}),
	})
	.required();

export { PresetGetByIdParametersValidationSchema };
