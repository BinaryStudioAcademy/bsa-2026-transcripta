import { createListenerMiddleware, isRejected } from "@reduxjs/toolkit";
import { ServerErrorType } from "@transcripta/shared";

import { notification } from "~/libs/modules/notification/notification.js";

import { DEFAULT_ERROR_MESSAGE } from "./libs/constants/constants.js";
import { isSerializedHTTPError } from "./libs/helpers/helpers.js";

const errorHandlingMiddleware = createListenerMiddleware();

errorHandlingMiddleware.startListening({
	effect: (action) => {
		if (action.meta.aborted || action.meta.condition) {
			return;
		}

		const error = action.error;
		if (!isSerializedHTTPError(error)) {
			notification.error(DEFAULT_ERROR_MESSAGE);
			return;
		}

		if (error.errorType === ServerErrorType.COMMON) {
			notification.error(error.message);
		} else {
			const validationMessage = error.details
				.map((detail) => detail.message)
				.join(". ");

			notification.error(validationMessage || DEFAULT_ERROR_MESSAGE);
		}
	},
	matcher: isRejected,
});

export { errorHandlingMiddleware };
