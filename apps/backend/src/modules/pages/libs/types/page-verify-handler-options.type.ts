import { type VerifyPageRequestDto } from "@transcripta/shared";

import { type APIHandlerOptions } from "~/libs/modules/controller/controller.js";
import { type TokenPayload } from "~/libs/modules/token/token.js";

type VerifyPageHandlerOptions = APIHandlerOptions<{
	body: VerifyPageRequestDto;
	params: {
		id: number;
	};
	user: TokenPayload;
}>;

export { type VerifyPageHandlerOptions };
