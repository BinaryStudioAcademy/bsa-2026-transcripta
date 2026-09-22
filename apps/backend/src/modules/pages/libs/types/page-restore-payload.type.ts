import { type PageStatusValue } from "@transcripta/shared";
import { type Transaction } from "objection";

type RestorePagePayload = {
	attempts: number;
	lastError: null | string;
	pageId: number;
	status: PageStatusValue;
	trx?: Transaction;
};

export { RestorePagePayload };
