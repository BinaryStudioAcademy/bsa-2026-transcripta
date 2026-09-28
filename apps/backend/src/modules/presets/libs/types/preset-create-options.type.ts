import { type PresetCreateRequestDto } from "@transcripta/shared";

import { type APIHandlerOptions } from "~/libs/modules/controller/controller.js";
import { type TokenPayload } from "~/libs/modules/token/token.js";

type PresetCreateOptions = APIHandlerOptions<{
	body: PresetCreateRequestDto;
	user: TokenPayload;
}>;

export { type PresetCreateOptions };
