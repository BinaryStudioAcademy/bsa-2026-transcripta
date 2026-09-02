import {
	type FastifyReply,
	type FastifyRequest,
	type preHandlerAsyncHookHandler,
} from "fastify";

import { type HTTPMethod } from "~/libs/modules/http/http.js";
import { type ValidationSchema } from "~/libs/types/types.js";

type ServerApplicationRouteParameters = {
	config?: Record<string, unknown>;
	handler: (
		request: FastifyRequest,
		reply: FastifyReply,
	) => Promise<void> | void;
	method: HTTPMethod;
	path: string;
	preHandler?: preHandlerAsyncHookHandler;
	validation?: {
		body?: ValidationSchema;
		params?: ValidationSchema;
		query?: ValidationSchema;
	};
};

export { type ServerApplicationRouteParameters };
