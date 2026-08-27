import { HTTPCode, HTTPError } from "@transcripta/shared";
import { type preHandlerAsyncHookHandler } from "fastify";

import {
	AuthErrorMessage,
	token,
	type TokenServiceInterface,
} from "~/libs/modules/token/token.js";

const BEARER_AUTHORIZATION_PATTERN = /^Bearer\s+(?<token>\S+)$/i;

const extractBearerToken = (authorizationHeader: string): null | string => {
	return (
		BEARER_AUTHORIZATION_PATTERN.exec(authorizationHeader)?.groups?.["token"] ??
		null
	);
};

const createUnauthorizedError = (): HTTPError => {
	return new HTTPError({
		message: AuthErrorMessage.INVALID_TOKEN,
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

const authGuard = createAuthGuard(token);

export { authGuard };
