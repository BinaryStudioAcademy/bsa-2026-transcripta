import { type Knex } from "knex";

import { type Logger } from "~/libs/modules/logger/logger.js";

import { type Preset } from "./preset.type.js";

type BuildContextOptions = {
	documentId: number;
	knex: Knex;
	logger: Logger;
	pageNo: number;
	preset: Preset;
};

export { type BuildContextOptions };
