import { HTTPCode } from "@transcripta/shared";

const RETRYABLE_HTTP_CODES: readonly number[] = [
	HTTPCode.INTERNAL_SERVER_ERROR,
	HTTPCode.BAD_GATEWAY,
	HTTPCode.GATEWAY_TIMEOUT,
	HTTPCode.SERVICE_UNAVAILABLE,
] as const;

export { RETRYABLE_HTTP_CODES };
