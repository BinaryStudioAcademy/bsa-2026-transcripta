import { type PageVerificationActionValue } from "./types.js";

type VerifyPageRequestDto = {
	action: PageVerificationActionValue;
	durationMs: number;
	text: string;
	transcriptionId: number;
};

export { VerifyPageRequestDto };
