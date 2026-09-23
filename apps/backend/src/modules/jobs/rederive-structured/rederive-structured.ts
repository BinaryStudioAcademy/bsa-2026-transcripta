import { type Job } from "bullmq";

import { type Logger } from "~/libs/modules/logger/logger.js";
import { type RederiveStructuredJobData } from "~/libs/modules/queue/queue.js";
import { type DocumentRepository } from "~/modules/documents/document.repository.js";
import { type TranscriptionRepository } from "~/modules/transcription/transcription.repository.js";
import { type TranscriptionService } from "~/modules/transcription/transcription.service.js";

import { ErrorMessage } from "./libs/enums/enums.js";

const createRederiveStructuredHandler =
	({
		documentRepository,
		logger,
		transcriptionRepository,
		transcriptionService,
	}: {
		documentRepository: DocumentRepository;
		logger: Logger;
		transcriptionRepository: TranscriptionRepository;
		transcriptionService: TranscriptionService;
	}) =>
	async (job: Job<RederiveStructuredJobData>): Promise<void> => {
		const { currentTranscriptionId, documentId, pageId, text } = job.data;

		const document = await documentRepository.findWithPresetById(documentId);

		if (!document) {
			logger.error(ErrorMessage.DOCUMENT_NOT_FOUND(documentId));
			return;
		}

		const transcription =
			await transcriptionRepository.findCurrentByPageId(pageId);

		if (!transcription) {
			logger.error(ErrorMessage.TRANSCRIPTION_NOT_FOUND(pageId));
			return;
		}

		if (transcription.id !== currentTranscriptionId) {
			logger.error(ErrorMessage.TRANSCRIPTION_OUTDATED(transcription.id));
			return;
		}

		const documentObject = document.toObjectWithPreset();
		const isBudgetAvailable =
			Number(documentObject.spentUsd) < Number(documentObject.budgetUsd);

		if (!isBudgetAvailable) {
			logger.warn(ErrorMessage.BUDGET_EXCEEDED(documentId));
			throw new Error(ErrorMessage.BUDGET_EXCEEDED(documentId));
		}

		try {
			const preset = documentObject.preset;
			const modelId = preset.settings.model || null;
			const outputSchema = preset.outputSchema || null;

			const result = await transcriptionService.rederiveStructured({
				modelId,
				outputSchema,
				text,
				transcriptionStructured:
					transcription.editedStructured ?? transcription.structured,
			});

			if (!result) {
				return;
			}

			if (result.costUsd) {
				await documentRepository.updateSpentUsd(
					documentObject.id,
					result.costUsd,
				);
			}

			if (result.structured) {
				await transcriptionRepository.updateEditedStructured(
					transcription.id,
					result.structured,
				);
			}
		} catch (error) {
			logger.error(ErrorMessage.REDERIVE_FAILED(pageId), { error });

			throw error;
		}
	};

export { createRederiveStructuredHandler };
