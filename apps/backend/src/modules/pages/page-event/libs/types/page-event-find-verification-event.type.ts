import { type PageVerificationActionValue } from "@transcripta/shared";

type FindVerificationEventPayload = {
	attempt: number;
	event: PageVerificationActionValue;
	pageId: number;
	transcriptionId: number;
};

export { FindVerificationEventPayload };
