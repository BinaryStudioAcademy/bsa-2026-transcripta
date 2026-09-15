import { type PageStatusValue } from "@transcripta/shared";
import { type Transaction } from "objection";

type RestorePageAfterReprocessFailurePayload = {
	attempts: number;
	lastError: null | string;
	pageId: number;
	status: PageStatusValue;
	trx?: Transaction;
};

export { RestorePageAfterReprocessFailurePayload };
