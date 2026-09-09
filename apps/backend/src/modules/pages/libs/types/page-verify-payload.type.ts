import { type VerifyPageRequestDto } from "@transcripta/shared";

type VerifyPagePayload = VerifyPageRequestDto & {
	pageId: number;
	userId: number;
};

export { VerifyPagePayload };
