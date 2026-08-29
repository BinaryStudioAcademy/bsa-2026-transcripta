import { type SerializedError } from "@reduxjs/toolkit";
import {
	type HTTPCode,
	type ServerErrorDetail,
	type ServerErrorType,
	type ValueOf,
} from "@transcripta/shared";

type SerializedAppError = SerializedError | SerializedHTTPError;

type SerializedHTTPError = {
	details: ServerErrorDetail[];
	errorType: ValueOf<typeof ServerErrorType>;
	message: string;
	status: ValueOf<typeof HTTPCode>;
};

export { type SerializedAppError, type SerializedHTTPError };
