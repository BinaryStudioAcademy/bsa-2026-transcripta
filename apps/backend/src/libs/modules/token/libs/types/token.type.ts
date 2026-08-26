import { type TokenPayload } from "./types.js";

type Token = {
	create(payload: TokenPayload): Promise<string>;
	verify(token: string): Promise<TokenPayload>;
};

export { type Token };
