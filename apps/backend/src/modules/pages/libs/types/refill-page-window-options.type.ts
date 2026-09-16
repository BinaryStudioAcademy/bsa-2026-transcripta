import { type Transaction } from "objection";

import { type PageRepository } from "~/modules/pages/page.repository.js";

type RefillPageWindowOptions = {
	documentId: number;
	pageRepository: PageRepository;
	quantity: number;
	trx: Transaction;
};

export { type RefillPageWindowOptions };
