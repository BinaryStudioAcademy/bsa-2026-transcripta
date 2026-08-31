import { AppRoute } from "~/libs/enums/enums.js";
import { type ValueOf } from "~/libs/types/types.js";

const AUTH_ROUTES = new Set<ValueOf<typeof AppRoute>>([
	AppRoute.SIGN_IN,
	AppRoute.SIGN_UP,
]);

export { AUTH_ROUTES };
