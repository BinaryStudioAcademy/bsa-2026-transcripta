import convict, { type Config as LibraryConfig } from "convict";
import { config } from "dotenv";

import { AppEnvironment } from "~/libs/enums/enums.js";
import { type Logger } from "~/libs/modules/logger/logger.js";

import {
	DEVELOPMENT_JWT_SECRET,
	DevelopmentJwtSecretMessage,
} from "./libs/constants/constants.js";
import { type Config, type EnvironmentSchema } from "./libs/types/types.js";

class BaseConfig implements Config {
	private logger: Logger;

	public ENV: EnvironmentSchema;

	public constructor(logger: Logger) {
		this.logger = logger;

		config();

		this.envSchema.load({});
		this.envSchema.validate({
			allowed: "strict",
			output: (message) => {
				this.logger.info(message);
			},
		});

		this.ENV = this.envSchema.getProperties();
		this.logger.info(".env file found and successfully parsed!");

		this.assertProductionJwtSecret();
		this.warnOnDevJwtSecret();
	}

	private get envSchema(): LibraryConfig<EnvironmentSchema> {
		return convict<EnvironmentSchema>({
			APP: {
				ENVIRONMENT: {
					default: null,
					doc: "Application environment",
					env: "NODE_ENV",
					format: Object.values(AppEnvironment),
				},
				HOST: {
					default: null,
					doc: "Host for server app",
					env: "HOST",
					format: String,
				},
				PORT: {
					default: null,
					doc: "Port for incoming connections",
					env: "PORT",
					format: Number,
				},
			},
			AUTH: {
				JWT_SECRET: {
					default: DEVELOPMENT_JWT_SECRET,
					doc: "Secret used to sign JWT tokens",
					env: "JWT_SECRET",
					format: String,
				},
			},
			BEDROCK: {
				MODEL_ID: {
					default: "us.amazon.nova-pro-v1:0",
					doc: "Bedrock inference profile id — never a bare model id",
					env: "BEDROCK_MODEL_ID",
					format: String,
				},
				REGION: {
					default: "us-east-1",
					doc: "AWS region the Bedrock runtime is called in",
					env: "AWS_REGION",
					format: String,
				},
			},
			DB: {
				CONNECTION_STRING: {
					default: null,
					doc: "Database connection string",
					env: "DB_CONNECTION_STRING",
					format: String,
				},
				DIALECT: {
					default: null,
					doc: "Database dialect",
					env: "DB_DIALECT",
					format: String,
				},
				POOL_MAX: {
					default: null,
					doc: "Database pool max count",
					env: "DB_POOL_MAX",
					format: Number,
				},
				POOL_MIN: {
					default: null,
					doc: "Database pool min count",
					env: "DB_POOL_MIN",
					format: Number,
				},
			},
		});
	}

	private assertProductionJwtSecret(): void {
		const isProduction = this.ENV.APP.ENVIRONMENT === AppEnvironment.PRODUCTION;

		if (isProduction && this.ENV.AUTH.JWT_SECRET === DEVELOPMENT_JWT_SECRET) {
			throw new Error(DevelopmentJwtSecretMessage.PRODUCTION_ERROR);
		}
	}

	private warnOnDevJwtSecret(): void {
		if (this.ENV.AUTH.JWT_SECRET === DEVELOPMENT_JWT_SECRET) {
			this.logger.warn(DevelopmentJwtSecretMessage.WARNING);
		}
	}
}

export { BaseConfig };
