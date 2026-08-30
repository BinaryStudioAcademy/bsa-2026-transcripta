import { type SerializedError } from "@reduxjs/toolkit";

import { type HTTPError } from "~/libs/modules/http/http.js";

type SerializedAppError = SerializedError | SerializedHTTPError;

type SerializedHTTPError = Pick<
	HTTPError,
	"details" | "errorType" | "message" | "status"
>;

export { type SerializedAppError };
