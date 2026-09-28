import knex, { type Knex } from "knex";
import { knexSnakeCaseMappers, Model } from "objection";

import { AppEnvironment } from "~/libs/enums/enums.js";
import { type Config } from "~/libs/modules/config/config.js";
import { type Logger } from "~/libs/modules/logger/logger.js";

import { DatabaseTableName } from "./libs/enums/enums.js";
import { type Database } from "./libs/types/types.js";

class BaseDatabase implements Database {
	private appConfig: Config;

	private knexInstance: Knex | null = null;

	private logger: Logger;

	public constructor(config: Config, logger: Logger) {
		this.appConfig = config;
		this.logger = logger;
	}

	private get environmentConfig(): Knex.Config {
		return this.environmentsConfig[this.appConfig.ENV.APP.ENVIRONMENT];
	}

	private get initialConfig(): Knex.Config {
		return {
			client: this.appConfig.ENV.DB.DIALECT,
			connection: this.appConfig.ENV.DB.CONNECTION_STRING,
			debug: false,
			migrations: {
				directory: "src/db/migrations",
				tableName: DatabaseTableName.MIGRATIONS,
			},
			pool: {
				max: this.appConfig.ENV.DB.POOL_MAX,
				min: this.appConfig.ENV.DB.POOL_MIN,
			},
			...knexSnakeCaseMappers({ underscoreBetweenUppercaseLetters: true }),
		};
	}

	public get environmentsConfig(): Database["environmentsConfig"] {
		return {
			[AppEnvironment.DEVELOPMENT]: this.initialConfig,
			[AppEnvironment.PRODUCTION]: this.initialConfig,
		};
	}

	public connect(): ReturnType<Database["connect"]> {
		this.logger.info("Establish DB connection...");

		this.knexInstance = knex.default(this.environmentConfig);

		Model.knex(this.knexInstance);
	}

	/**
	 * The pool keeps sockets open, and `pool.min` never lets the reaper take
	 * them, so nothing closes them on its own. Without this the process hangs
	 * on shutdown exactly like an unclosed Redis connection would.
	 */
	public async disconnect(): Promise<void> {
		const knexInstance = this.knexInstance;

		this.knexInstance = null;

		if (knexInstance) {
			await knexInstance.destroy();
		}
	}
}

export { BaseDatabase };
