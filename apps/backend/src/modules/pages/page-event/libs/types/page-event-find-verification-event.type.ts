import { type PageVerificationActionValue } from "@transcripta/shared";

type FindVerificationEventPayload = {
	event: PageVerificationActionValue;
	pageId: number;
	transcriptionId: number;
};

export { FindVerificationEventPayload };
