import { DocumentModel } from "~/modules/documents/document.model.js";
import { TRANSCRIBABLE_STATUSES } from "~/modules/jobs/libs/constants/constants.js";
import { type PageEntity } from "~/modules/pages/page.entity.js";

import { type RefillPageWindowOptions } from "../types/types.js";

const refillPageWindow = async ({
	documentId,
	pageRepository,
	quantity,
	trx,
}: RefillPageWindowOptions): Promise<PageEntity[]> => {
	const document = await DocumentModel.query(trx)
		.findById(documentId)
		.forUpdate();

	if (!document || !TRANSCRIBABLE_STATUSES.has(document.status)) {
		return [];
	}

	return await pageRepository.updateFirstPendingPagesAsQueued(
		documentId,
		quantity,
		trx,
	);
};

export { refillPageWindow };
