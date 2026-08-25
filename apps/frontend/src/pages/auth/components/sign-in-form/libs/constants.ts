import { type UserSignUpRequestDto } from "~/modules/users/users.js";

// Replace sign up with sign in
const DEFAULT_SIGN_IN_PAYLOAD: UserSignUpRequestDto = {
	email: "",
	password: "",
};

export { DEFAULT_SIGN_IN_PAYLOAD };
