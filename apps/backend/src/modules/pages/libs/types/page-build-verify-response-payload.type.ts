import { PageStatusValue } from "@transcripta/shared";

type BuildVerifyResponsePayload = {
	documentId: number;
	pageId: number;
	pageNo: number;
	status: PageStatusValue;
};

export { BuildVerifyResponsePayload };
