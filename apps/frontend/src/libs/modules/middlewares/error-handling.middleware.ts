import { createListenerMiddleware, isRejected } from "@reduxjs/toolkit";
import { HTTPCode, ServerErrorType } from "@transcripta/shared";

import { notification } from "~/libs/modules/notification/notification.js";
import { SerializedAppError } from "~/libs/types/serialized-app-error.type.js";

import { DEFAULT_ERROR_MESSAGE } from "./libs/constants/constants.js";
import { storage, StorageKey } from "../storage/storage.js";
import { actions } from "~/modules/auth/auth.js";

const errorHandlingMiddleware = createListenerMiddleware();

errorHandlingMiddleware.startListening({
	effect: async (action, listenerApi) => {
		if (action.meta.aborted || action.meta.condition) {
			return;
		}

		const error = action.error as SerializedAppError;

		if ("status" in error && error.status === HTTPCode.UNAUTHORIZED) {
			await storage.drop(StorageKey.TOKEN);
			listenerApi.dispatch(actions.logout());

			return;
		}

		if (!("errorType" in error)) {
			notification.error(DEFAULT_ERROR_MESSAGE);
			return;
		}

		if (error.errorType === ServerErrorType.VALIDATION) {
			const validationMessage = error.details
				.map((detail) => detail.message)
				.join(". ");

			notification.error(validationMessage);
			return;
		}
		notification.error(error.message);
	},
	matcher: isRejected,
});

export { errorHandlingMiddleware };
