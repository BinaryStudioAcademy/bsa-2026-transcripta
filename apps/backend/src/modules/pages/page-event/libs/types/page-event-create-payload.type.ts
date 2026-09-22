import { type PageVerificationActionValue } from "@transcripta/shared";

type CreatePageEventPayload = {
	actorId: number;
	attempt: number;
	documentId: number;
	durationMs: number;
	event: PageVerificationActionValue;
	pageId: number;
	transcriptionId: number;
};

export { CreatePageEventPayload };
