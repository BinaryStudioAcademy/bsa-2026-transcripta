import { type store } from "~/libs/modules/store/store.js";
import { type RootState } from "~/libs/types/types.js";

import { type SerializedAppError } from "./serialized-app-error.type.js";

type AsyncThunkConfig = {
	dispatch: typeof store.instance.dispatch;
	extra: typeof store.extraArguments;
	serializedErrorType: SerializedAppError;
	state: RootState;
};

export { type AsyncThunkConfig };
