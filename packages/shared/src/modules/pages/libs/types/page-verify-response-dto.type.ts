import { type ContextWordDto, type PageStatusValue } from "./types.js";

type VerifyPageLexiconItemDto = {
	distinctPages: number;
	id: number;
	inContext: boolean;
	word: string;
};

type VerifyPageNextDto = {
	pageId: number;
	pageNo: number;
	status: PageStatusValue;
	transcription: null | VerifyPageTranscriptionDto;
};

type VerifyPageResponseDto = {
	lexiconAdded: VerifyPageLexiconItemDto[];
	next: null | VerifyPageNextDto;
	pageId: number;
	status: PageStatusValue;
};

type VerifyPageTranscriptionDto = {
	contextWords: ContextWordDto[];
	text: string;
};

export { VerifyPageResponseDto };
