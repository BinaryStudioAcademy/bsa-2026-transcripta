import { type VerifyPageRequestDto } from "@transcripta/shared";

type VerificationQueueItem = {
	documentId: number;
	pageId: number;
	pageNo: number;
	payload: VerifyPageRequestDto;
};

export { type VerificationQueueItem };
