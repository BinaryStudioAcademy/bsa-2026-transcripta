// Add create(payload)
// Add verify(token)
import { jwtVerify, SignJWT } from "jose";

import { type Token, type TokenPayload } from "./libs/types/types.js";

const JWT_ALGORITHM = "HS256";
const JWT_EXPIRATION_TIME = "24h";

class BaseToken implements Token {
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
		const { payload } = await jwtVerify(token, this.secret, {
			algorithms: [JWT_ALGORITHM],
		});
		const { userId } = payload;

		if (typeof userId !== "number") {
			throw new TypeError("Token payload does not contain a valid user id.");
		}

		return payload as TokenPayload;
	}
}

export { BaseToken };
