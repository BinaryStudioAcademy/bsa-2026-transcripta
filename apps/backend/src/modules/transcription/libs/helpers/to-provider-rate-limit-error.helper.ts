import { RateLimitError } from "@anthropic-ai/sdk";
import {
	ServiceQuotaExceededException,
	ThrottlingException,
} from "@aws-sdk/client-bedrock-runtime";
import { EMPTY_LENGTH } from "@transcripta/shared";

import { ProviderRateLimitError } from "~/libs/exceptions/exceptions.js";

import {
	MILLISECONDS_IN_SECOND,
	RETRY_AFTER_HEADER,
} from "../constants/constants.js";

const parseRetryAfterMs = (error: RateLimitError): null | number => {
	const seconds = Number(error.headers.get(RETRY_AFTER_HEADER));

	return Number.isFinite(seconds) && seconds > EMPTY_LENGTH
		? seconds * MILLISECONDS_IN_SECOND
		: null;
};

const toProviderRateLimitError = (
	error: unknown,
): null | ProviderRateLimitError => {
	if (error instanceof RateLimitError) {
		return new ProviderRateLimitError(parseRetryAfterMs(error));
	}

	if (
		error instanceof ThrottlingException ||
		error instanceof ServiceQuotaExceededException
	) {
		return new ProviderRateLimitError(null);
	}

	return null;
};

export { toProviderRateLimitError };
