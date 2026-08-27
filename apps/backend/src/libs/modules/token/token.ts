import { config } from "~/libs/modules/config/config.js";

import { TokenService } from "./base-token.module.js";

const token = new TokenService(config.ENV.AUTH.JWT_SECRET);

export { AuthErrorMessage } from "./libs/constants/constants.js";
export { token };
export {
	type TokenPayload,
	type TokenServiceInterface,
} from "./libs/types/types.js";
