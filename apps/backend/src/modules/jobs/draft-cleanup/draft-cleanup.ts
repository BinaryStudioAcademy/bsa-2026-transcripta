import { Logger } from "~/libs/modules/logger/logger.js";
import { BaseStorage } from "~/libs/modules/storage/base-storage.module.js";
import { StorageBucket } from "~/libs/modules/storage/storage.js";
import { DocumentEntity } from "~/modules/documents/document.entity.js";
import { DocumentRepository } from "~/modules/documents/document.repository.js";

import { TWENTY_FOUR_HOURS_IN_MS } from "./libs/constants/constants.js";
import { DocumentStatus, ErrorMessage } from "./libs/enums/enums.js";

const createDraftCleanupHandler =
	({
		documentRepository,
		logger,
		storage,
	}: {
		documentRepository: DocumentRepository;
		logger: Logger;
		storage: BaseStorage;
	}) =>
	async (): Promise<void> => {
		const twentyFourHoursAgo = new Date(
			Date.now() - TWENTY_FOUR_HOURS_IN_MS,
		).toISOString();

		let abandonedDrafts: DocumentEntity[] = [];
		try {
			abandonedDrafts =
				await documentRepository.findDraftsOlderThan(twentyFourHoursAgo);
		} catch (error) {
			logger.error(ErrorMessage.FAILED_TO_GET_ABANDONED_DRAFTS, {
				error,
			});
		}

		for (const draft of abandonedDrafts) {
			const documentId = draft.toObject().id;

			try {
				const currentDraft = await documentRepository.findById(documentId);

				if (currentDraft?.toObject().status !== DocumentStatus.DRAFT) {
					continue;
				}

				await storage.deleteByPrefix({
					bucket: StorageBucket.UPLOADS,
					prefix: `${StorageBucket.UPLOADS}/${documentId.toString()}/`,
				});

				await documentRepository.deleteById(documentId);
			} catch (error) {
				logger.error(
					`${ErrorMessage.FAILED_TO_CLEANUP_DRAFT}: ${documentId.toString()}`,
					{
						error,
					},
				);
			}
		}
	};

export { createDraftCleanupHandler };
