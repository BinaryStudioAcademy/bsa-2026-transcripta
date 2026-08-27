import { jwtVerify, SignJWT } from "jose";

import {
	JWT_ALGORITHM,
	JWT_EXPIRATION_TIME,
	TokenErrorMessage,
} from "./libs/constants/constants.js";
import {
	type TokenPayload,
	type TokenServiceInterface,
} from "./libs/types/types.js";

class TokenService implements TokenServiceInterface {
	private secret: Uint8Array;

	public constructor(secret: string) {
		this.secret = new TextEncoder().encode(secret);
	}

	public async create(payload: TokenPayload): Promise<string> {
		return await new SignJWT(payload)
			.setProtectedHeader({
				alg: JWT_ALGORITHM,
				typ: "JWT",
			})
			.setIssuedAt()
			.setExpirationTime(JWT_EXPIRATION_TIME)
			.sign(this.secret);
	}

	public async verify(token: string): Promise<TokenPayload> {
		try {
			const { payload } = await jwtVerify(token, this.secret, {
				algorithms: [JWT_ALGORITHM],
			});
			const { userId } = payload;

			if (typeof userId !== "number") {
				throw new TypeError(TokenErrorMessage.INVALID_TOKEN_PAYLOAD);
			}

			return payload as TokenPayload;
		} catch {
			throw new Error(TokenErrorMessage.INVALID_TOKEN);
		}
	}
}

export { TokenService };
