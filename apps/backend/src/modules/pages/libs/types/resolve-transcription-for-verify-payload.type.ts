import {
	type PageStatusValue,
	type PageVerificationActionValue,
} from "@transcripta/shared";
import { type Transaction } from "objection";

import { type DocumentEntity } from "~/modules/documents/document.entity.js";

type ResolveTranscriptionForVerifyPayload = {
	action: PageVerificationActionValue;
	document: DocumentEntity;
	page: {
		documentId: number;
		status: PageStatusValue;
	};
	pageId: number;
	text: string | undefined;
	transcriptionId: number | undefined;
	trx: Transaction;
};

export { type ResolveTranscriptionForVerifyPayload };
