import { type TokenPayload } from "~/libs/modules/token/token.js";

declare module "fastify" {
	interface FastifyRequest {
		user: TokenPayload;
	}
}
