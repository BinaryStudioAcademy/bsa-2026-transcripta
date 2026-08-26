import { encryption } from "~/libs/modules/encryption/encryption.js";
import { logger } from "~/libs/modules/logger/logger.js";
import { userService } from "~/modules/users/users.js";

import { AuthController } from "./auth.controller.js";
import { AuthService } from "./auth.service.js";

const authService = new AuthService(userService, encryption);
const authController = new AuthController(logger, authService);

export { authController };
