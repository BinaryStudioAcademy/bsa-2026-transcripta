import { type APIHandlerOptions } from "~/libs/modules/controller/controller.js";
import { type TokenPayload } from "~/libs/modules/token/token.js";

type UndoPageHandlerOptions = APIHandlerOptions<{
	params: {
		id: number;
	};
	user: TokenPayload;
}>;

export { type UndoPageHandlerOptions };
