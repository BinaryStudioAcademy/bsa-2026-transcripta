import { miniSerializeError } from "@reduxjs/toolkit";

import { HTTPError } from "~/libs/modules/http/http.js";
import { type SerializedAppError } from "~/libs/types/types.js";

const serializeError = (error: unknown): SerializedAppError => {
	if (error instanceof HTTPError) {
		return {
			details: error.details,
			errorType: error.errorType,
			message: error.message,
			status: error.status,
		};
	}

	return miniSerializeError(error);
};

export { serializeError };
