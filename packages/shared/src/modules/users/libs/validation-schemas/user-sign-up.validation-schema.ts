import { z } from "zod";

import { UserValidationMessage, UserValidationRule } from "../enums/enums.js";
import { STRING_MINIMUM_LENGTH } from "./libs/constants/constants.js";

type UserSignUpRequestValidationDto = {
	email: z.ZodString;
	password: z.ZodString;
};

const userSignUp = z
	.object<UserSignUpRequestValidationDto>({
		email: z
			.string()
			.trim()
			.min(UserValidationRule.EMAIL_MINIMUM_LENGTH, {
				message: UserValidationMessage.EMAIL_REQUIRE,
			})
			.email({
				message: UserValidationMessage.EMAIL_WRONG,
			}),
		password: z
			.string()
			.trim()
			.min(STRING_MINIMUM_LENGTH, {
				message: UserValidationMessage.PASSWORD_REQUIRE,
			})
			.min(UserValidationRule.PASSWORD_MINIMUM_LENGTH, {
				message: UserValidationMessage.PASSWORD_MINIMUM_LENGTH,
			}),
	})
	.required();

export { userSignUp };
