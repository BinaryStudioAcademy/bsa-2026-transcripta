import {
	type PageStatusValue,
	type VerifyPageLexiconItemDto,
} from "@transcripta/shared";

type BuildVerifyResponsePayload = {
	documentId: number;
	lexiconAdded: VerifyPageLexiconItemDto[];
	pageId: number;
	pageNo: number;
	status: PageStatusValue;
};

export { BuildVerifyResponsePayload };
