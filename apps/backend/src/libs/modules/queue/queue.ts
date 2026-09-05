import { config } from "~/libs/modules/config/config.js";

import { BaseQueue } from "./base-queue.module.js";

const transcribeQueue = new BaseQueue(config, "page.transcribe");

export { transcribeQueue };
export { type QueueJobPayload } from "./base-queue.module.js";
