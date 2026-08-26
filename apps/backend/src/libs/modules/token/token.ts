import { config } from "~/libs/modules/config/config.js";

import { TokenService } from "./base-token.module.js";

const token = new TokenService(config.ENV.AUTH.JWT_SECRET);

export { token };
export { type TokenServiceInterface } from "./libs/types/types.js";
