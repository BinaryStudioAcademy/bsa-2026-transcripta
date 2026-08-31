import { createListenerMiddleware, isRejected } from "@reduxjs/toolkit";
import { ServerErrorType } from "@transcripta/shared";

import { notification } from "~/libs/modules/notification/notification.js";
import { SerializedAppError } from "~/libs/types/serialized-app-error.type.js";

import { DEFAULT_ERROR_MESSAGE } from "./libs/constants/constants.js";

const errorHandlingMiddleware = createListenerMiddleware();

errorHandlingMiddleware.startListening({
	effect: (action) => {
		if (action.meta.aborted || action.meta.condition) {
			return;
		}

		const error = action.error as SerializedAppError;

		if (!("errorType" in error)) {
			notification.error(DEFAULT_ERROR_MESSAGE);
			return;
		}

		if (error.errorType === ServerErrorType.VALIDATION) {
			const validationMessage = error.details
				.map((detail) => detail.message)
				.join(". ");

			notification.error(validationMessage);
		}
		notification.error(error.message);
	},
	matcher: isRejected,
});

export { errorHandlingMiddleware };
