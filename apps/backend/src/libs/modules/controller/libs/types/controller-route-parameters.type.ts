import { type preHandlerAsyncHookHandler } from "fastify";

import { type HTTPMethodValue } from "~/libs/modules/http/http.js";
import { type ValidationSchema } from "~/libs/types/types.js";

import { type APIHandler } from "./api-handler.type.js";

type ControllerRouteParameters = {
	config?: Record<string, unknown>;
	handler: APIHandler;
	method: HTTPMethodValue;
	path: string;
	preHandler?: preHandlerAsyncHookHandler;
	validation?: {
		body?: ValidationSchema;
		params?: ValidationSchema;
		query?: ValidationSchema;
	};
};

export { type ControllerRouteParameters };
