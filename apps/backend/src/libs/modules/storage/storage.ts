import { config } from "~/libs/modules/config/config.js";

import { BaseStorage } from "./base-storage.module.js";

const storage = new BaseStorage(config);

export { storage };
