import { token } from "~/libs/modules/token/token.js";

import { createAuthGuard } from "./auth-guard.js";

const authGuard = createAuthGuard(token);

export { authGuard };
