import { createListenerMiddleware, isRejected } from "@reduxjs/toolkit";
import { HTTPCode, ServerErrorType } from "@transcripta/shared";

import { DEFAULT_ERROR_MESSAGE } from "~/libs/constants/constants.js";
import { notification } from "~/libs/modules/notification/notification.js";
import { SerializedAppError } from "~/libs/types/serialized-app-error.type.js";
import { actions as authActions } from "~/modules/auth/auth.js";
import { actions as documentActions } from "~/modules/documents/documents.js";
import { actions as pageActions } from "~/modules/pages/pages.js";

import { storage, StorageKey } from "../storage/storage.js";
import { SESSION_EXPIRED_MESSAGE } from "./libs/constants/constants.js";

const errorHandlingMiddleware = createListenerMiddleware();

const getErrorMessage = (message?: string): string => {
	if (!message) {
		return DEFAULT_ERROR_MESSAGE;
	}

	const trimmedMessage = message.trim();
	if (trimmedMessage.length === 0) {
		return DEFAULT_ERROR_MESSAGE;
	}

	return trimmedMessage;
};

errorHandlingMiddleware.startListening({
	effect: async (action, listenerApi) => {
		if (action.meta.aborted || action.meta.condition) {
			return;
		}

		const error = action.error as SerializedAppError;

		const isAuthCredentialRejection =
			action.type === authActions.signIn.rejected.type ||
			action.type === authActions.signUp.rejected.type;

		if (
			!isAuthCredentialRejection &&
			"status" in error &&
			error.status === HTTPCode.UNAUTHORIZED
		) {
			await storage.drop(StorageKey.TOKEN);
			listenerApi.dispatch(authActions.logout());
			notification.error(SESSION_EXPIRED_MESSAGE);

			return;
		}

		if (action.type === authActions.signUp.rejected.type) {
			return;
		}

		if (
			action.type === documentActions.pollDocumentById.rejected.type ||
			action.type === documentActions.loadById.rejected.type ||
			action.type === documentActions.updateBudget.rejected.type
		) {
			return;
		}

		if (
			action.type === documentActions.ingest.rejected.type ||
			action.type === documentActions.watchExport.rejected.type
		) {
			return;
		}

		if (
			action.type === pageActions.verifyPage.rejected.type &&
			"status" in error &&
			error.status === HTTPCode.CONFLICT
		) {
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

			const safeValidationMessage = getErrorMessage(validationMessage);
			notification.error(safeValidationMessage);
			return;
		}
		notification.error(getErrorMessage(error.message));
	},
	matcher: isRejected,
});

export { errorHandlingMiddleware };
