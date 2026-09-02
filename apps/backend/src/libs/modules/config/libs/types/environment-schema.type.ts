import { type AppEnvironment } from "~/libs/enums/enums.js";
import { type ValueOf } from "~/libs/types/types.js";

type EnvironmentSchema = {
	APP: {
		ENVIRONMENT: ValueOf<typeof AppEnvironment>;
		HOST: string;
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
		CONNECTION_STRING: string;
	};
};

export { type EnvironmentSchema };
