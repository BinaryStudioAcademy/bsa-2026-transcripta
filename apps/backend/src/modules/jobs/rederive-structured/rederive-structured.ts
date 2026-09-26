import { type Job } from "bullmq";

import { type Logger } from "~/libs/modules/logger/logger.js";
import { type RederiveStructuredJobData } from "~/libs/modules/queue/queue.js";
import { DEFAULT_PRESET_SETTINGS } from "~/modules/context/builder/libs/constants/default-preset-settings.constant.js";
import { type DocumentRepository } from "~/modules/documents/document.repository.js";
import { type LexiconUpdateService } from "~/modules/lexicon/lexicon-update.service.js";
import { TranscriptionModel } from "~/modules/transcription/transcription.model.js";
import { type TranscriptionRepository } from "~/modules/transcription/transcription.repository.js";
import { type TranscriptionService } from "~/modules/transcription/transcription.service.js";

import { ErrorMessage, InfoMessage } from "./libs/enums/enums.js";

const createRederiveStructuredHandler =
	({
		documentRepository,
		lexiconUpdateService,
		logger,
		transcriptionRepository,
		transcriptionService,
	}: {
		documentRepository: DocumentRepository;
		lexiconUpdateService: LexiconUpdateService;
		logger: Logger;
		transcriptionRepository: TranscriptionRepository;
		transcriptionService: TranscriptionService;
	}) =>
	async (job: Job<RederiveStructuredJobData>): Promise<void> => {
		const {
			currentTranscriptionId,
			documentId,
			jobCreatedAt,
			pageId,
			pageNo,
			text,
		} = job.data;

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

		if (
			transcription.rederiveStructuredJobCreatedAt &&
			new Date(transcription.rederiveStructuredJobCreatedAt) >
				new Date(jobCreatedAt)
		) {
			logger.info(InfoMessage.JOB_SKIPPED_BEFORE_MODEL(pageId));
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
			const modelId = preset.settings?.model ?? null;
			const outputSchema = preset.outputSchema ?? null;

			let result = await transcriptionService.rederiveStructured({
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

			const minDistinctPages =
				preset.settings?.minDistinctPages ??
				DEFAULT_PRESET_SETTINGS.minDistinctPages;

			if (result.structured) {
				const isUpdated =
					await transcriptionRepository.updateEditedStructuredIfActual({
						editedStructured: result.structured,
						id: transcription.id,
						jobCreatedAt,
					});

				if (!isUpdated) {
					logger.info(InfoMessage.JOB_SKIPPED_AFTER_MODEL(pageId));
					return;
				}
				await TranscriptionModel.transaction(async (trx) => {
					await transcriptionRepository.updateEditedStructured(
						transcription.id,
						result.structured,
						trx,
					);

					await lexiconUpdateService.updateLexiconFromVerifiedPage({
						documentId,
						minDistinctPages,
						outputSchema,
						pageNo,
						structured: result.structured,
						text,
						trx,
					});
				});
			}
		} catch (error) {
			logger.error(ErrorMessage.REDERIVE_FAILED(pageId), { error });

			throw error;
		}
	};

export { createRederiveStructuredHandler };
