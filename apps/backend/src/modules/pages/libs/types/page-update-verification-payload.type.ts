import { type PageStatusValue } from "@transcripta/shared";

type UpdatePageVerificationPayload = {
	pageId: number;
	status: PageStatusValue;
	verifiedAt: null | string;
	verifiedBy: null | number;
};

export { UpdatePageVerificationPayload };
