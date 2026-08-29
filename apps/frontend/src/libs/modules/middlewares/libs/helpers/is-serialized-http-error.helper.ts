import { ServerErrorType } from "~/libs/enums/enums.js";
import {
	type SerializedHTTPError,
	type ServerErrorDetail,
} from "~/libs/types/types.js";

const isRecord = (value: unknown): value is Record<string, unknown> => {
	return typeof value === "object" && value !== null;
};

const isServerErrorDetail = (value: unknown): value is ServerErrorDetail => {
	if (!isRecord(value)) {
		return false;
	}

	return (
		typeof value["message"] === "string" &&
		Array.isArray(value["path"]) &&
		value["path"].every(
			(part) => typeof part === "number" || typeof part === "string",
		)
	);
};

const isSerializedHTTPError = (
	error: unknown,
): error is SerializedHTTPError => {
	if (!isRecord(error)) {
		return false;
	}

	return (
		typeof error["message"] === "string" &&
		typeof error["status"] === "number" &&
		(error["errorType"] === ServerErrorType.COMMON ||
			error["errorType"] === ServerErrorType.VALIDATION) &&
		Array.isArray(error["details"]) &&
		error["details"].every((detail) => isServerErrorDetail(detail))
	);
};

export { isSerializedHTTPError };
