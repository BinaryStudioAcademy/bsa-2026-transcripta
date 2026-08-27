import { HTTPCode, HTTPError } from "@transcripta/shared";
import { type preHandlerAsyncHookHandler } from "fastify";

import {
	TokenErrorMessage,
	type TokenServiceInterface,
} from "~/libs/modules/token/token.js";

import { extractBearerToken } from "./libs/helpers/helpers.js";

const createUnauthorizedError = (): HTTPError => {
	return new HTTPError({
		message: TokenErrorMessage.INVALID_TOKEN,
		status: HTTPCode.UNAUTHORIZED,
	});
};

const createAuthGuard = (
	tokenService: TokenServiceInterface,
): preHandlerAsyncHookHandler => {
	return async (request): Promise<void> => {
		const authorizationHeader = request.headers.authorization;

		if (!authorizationHeader) {
			throw createUnauthorizedError();
		}

		const tokenValue = extractBearerToken(authorizationHeader);

		if (!tokenValue) {
			throw createUnauthorizedError();
		}

		try {
			request.user = await tokenService.verify(tokenValue);
		} catch {
			throw createUnauthorizedError();
		}
	};
};

export { createAuthGuard };
