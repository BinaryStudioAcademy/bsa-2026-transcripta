import { z } from "zod";

import { UserValidationMessage, UserValidationRule } from "../enums/enums.js";
import { STRING_MINIMUM_LENGTH } from "./libs/constants/constants.js";

type UserSignInRequestValidationDto = {
	email: z.ZodString;
	password: z.ZodString;
};

const userSignIn = z
	.object<UserSignInRequestValidationDto>({
		email: z
			.string()
			.trim()
			.toLowerCase()
			.min(UserValidationRule.EMAIL_MINIMUM_LENGTH, {
				message: UserValidationMessage.EMAIL_REQUIRE,
			})
			.email({
				message: UserValidationMessage.EMAIL_WRONG,
			}),
		password: z
			.string()
			.min(STRING_MINIMUM_LENGTH, {
				message: UserValidationMessage.PASSWORD_REQUIRE,
			})
			.regex(UserValidationRule.PASSWORD_NO_WHITESPACE_REGEX, {
				message: UserValidationMessage.PASSWORD_NO_WHITESPACE,
			})
			.min(UserValidationRule.PASSWORD_MINIMUM_LENGTH, {
				message: UserValidationMessage.PASSWORD_MINIMUM_LENGTH,
			}),
	})
	.required();

export { userSignIn };
