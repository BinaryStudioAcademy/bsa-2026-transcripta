import {
	type PageStatusValue,
	type VerifyPageTranscriptionDto,
} from "./types.js";

type VerifyPageNextDto = {
	pageId: number;
	pageNo: number;
	status: PageStatusValue;
	transcription: null | VerifyPageTranscriptionDto;
};

export { VerifyPageNextDto };
