import { type AppEnvironment, type AppMode } from "~/libs/enums/enums.js";
import { type ValueOf } from "~/libs/types/types.js";

type EnvironmentSchema = {
	APP: {
		ENVIRONMENT: ValueOf<typeof AppEnvironment>;
		HOST: string;
		MODE: ValueOf<typeof AppMode>;
		PORT: number;
	};
	AUTH: {
		JWT_SECRET: string;
	};
	BEDROCK: {
		MODEL_ID: string;
		REGION: string;
	};
	DB: {
		CONNECTION_STRING: string;
		DIALECT: string;
		POOL_MAX: number;
		POOL_MIN: number;
	};
	REDIS: {
		URL: string;
	};
	STORAGE: {
		ACCESS_KEY_ID: string;
		BUCKET_PAGES: string;
		BUCKET_UPLOADS: string;
		ENDPOINT: string;
		REGION: string;
		SECRET_ACCESS_KEY: string;
	};
};

export { type EnvironmentSchema };
