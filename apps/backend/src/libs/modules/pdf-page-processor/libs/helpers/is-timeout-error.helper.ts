import { SIGTERM_SIGNAL, TIMEOUT_ERROR_CODE } from "../constants/constants.js";

const isTimeoutError = (error: unknown): boolean => {
	if (typeof error !== "object" || error === null) {
		return false;
	}

	const typedError = error as {
		code?: string;
		killed?: boolean;
		signal?: string;
	};

	return (
		(typedError.killed === true && typedError.signal === SIGTERM_SIGNAL) ||
		typedError.code === TIMEOUT_ERROR_CODE
	);
};

export { isTimeoutError };
