import { type DocumentIdRequestDto } from "@transcripta/shared";

import { type APIHandlerOptions } from "~/libs/modules/controller/controller.js";
import { type TokenPayload } from "~/libs/modules/token/token.js";

type DocumentDeleteOptions = APIHandlerOptions<{
	params: DocumentIdRequestDto;
	user: TokenPayload;
}>;

export { type DocumentDeleteOptions };
