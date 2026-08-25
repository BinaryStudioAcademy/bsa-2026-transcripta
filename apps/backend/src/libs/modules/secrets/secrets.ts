import { config } from "~/libs/modules/config/config.js";

import { BaseSecrets } from "./base-secrets.module.js";

const secrets = new BaseSecrets(config.ENV.BEDROCK.REGION);

export { secrets };

export { BaseSecrets } from "./base-secrets.module.js";
