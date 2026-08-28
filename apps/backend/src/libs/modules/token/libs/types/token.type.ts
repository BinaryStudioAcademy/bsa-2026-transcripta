import { type TokenPayload } from "./types.js";

type TokenServiceInterface = {
	create(payload: TokenPayload): Promise<string>;
	verify(token: string): Promise<TokenPayload>;
};

export { type TokenServiceInterface };
