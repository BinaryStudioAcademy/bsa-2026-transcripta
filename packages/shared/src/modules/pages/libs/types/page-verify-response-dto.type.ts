import {
	type PageStatusValue,
	type VerifyPageLexiconItemDto,
	type VerifyPageNextDto,
} from "./types.js";

type VerifyPageResponseDto = {
	lexiconAdded: VerifyPageLexiconItemDto[];
	next: null | VerifyPageNextDto;
	pageId: number;
	status: PageStatusValue;
};

export { VerifyPageResponseDto };
