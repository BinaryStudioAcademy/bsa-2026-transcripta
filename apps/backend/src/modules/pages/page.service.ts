import {
	HTTPCode,
	HTTPError,
	type PageDebugResponseDto,
	PageStatus,
	PageVerificationAction,
	type VerifyPageResponseDto,
} from "@transcripta/shared";
import { type Transaction, UniqueViolationError } from "objection";

import { type Logger } from "~/libs/modules/logger/logger.js";
import { type PageTranscribeQueue } from "~/libs/modules/queue/page-transcribe-queue.module.js";

import { DocumentEntity } from "../documents/document.entity.js";
import { DocumentModel } from "../documents/document.model.js";
import { type DocumentRepository } from "../documents/document.repository.js";
import { type TranscriptionRepository } from "../transcription/transcription.repository.js";
import { TranscriptionService } from "../transcription/transcription.service.js";
import {
	CLOSED_PAGE_STATUSES,
	NUMBER_OF_PAGES_TO_INCREMENT,
} from "./libs/constants/constants.js";
import {
	PageErrorMessage,
	PageErrorType,
	StatusByAction,
} from "./libs/enums/enums.js";
import { refillPageWindow } from "./libs/helpers/helpers.js";
import {
	type BuildVerifyResponsePayload,
	type PageServiceDependencies,
	type ReprocessPagePayload,
	type VerifyPagePayload,
} from "./libs/types/types.js";
import { type PageEventRepository } from "./page-event/page-event.repository.js";
import { type PageRepository } from "./page.repository.js";

class PageService {
	private documentRepository: DocumentRepository;

	private logger: Logger;

	private pageEventRepository: PageEventRepository;

	private pageRepository: PageRepository;

	private pageTranscribeQueue: PageTranscribeQueue;

	private transcriptionRepository: TranscriptionRepository;

	private transcriptionService: TranscriptionService;

	public constructor({
		documentRepository,
		logger,
		pageEventRepository,
		pageRepository,
		pageTranscribeQueue,
		transcriptionRepository,
		transcriptionService,
	}: PageServiceDependencies) {
		this.pageRepository = pageRepository;
		this.logger = logger;
		this.pageTranscribeQueue = pageTranscribeQueue;
		this.transcriptionRepository = transcriptionRepository;
		this.transcriptionService = transcriptionService;
		this.pageEventRepository = pageEventRepository;
		this.documentRepository = documentRepository;
	}

	private async buildVerifyResponse(
		payload: BuildVerifyResponsePayload,
		trx?: Transaction,
	): Promise<VerifyPageResponseDto> {
		const { documentId, pageId, pageNo, status } = payload;

		const nextPageNo = pageNo + NUMBER_OF_PAGES_TO_INCREMENT;

		const nextPage = await this.pageRepository.findByDocumentAndPageNo(
			documentId,
			nextPageNo,
			trx,
		);

		if (!nextPage) {
			return {
				lexiconAdded: [],
				next: null,
				pageId,
				status,
			};
		}

		const nextTranscription =
			await this.transcriptionRepository.findCurrentByPageId(nextPage.id, trx);

		return {
			lexiconAdded: [],
			next: {
				pageId: nextPage.id,
				pageNo: nextPage.pageNo,
				status: nextPage.status,
				transcription: nextTranscription
					? {
							contextWords: [],
							text: nextTranscription.editedText ?? nextTranscription.text,
						}
					: null,
			},
			pageId,
			status,
		};
	}

	private async handleCorrection({
		document,
		text,
		transcriptionId,
		transcriptionStructured,
		trx,
	}: {
		document: DocumentEntity;
		text: string;
		transcriptionId: number;
		transcriptionStructured: null | Record<string, unknown>;
		trx: Transaction;
	}) {
		await this.transcriptionRepository.updateEditedText(
			transcriptionId,
			text,
			trx,
		);

		const documentObject = document.toObjectWithPreset();
		const isBudgetAvailable =
			Number(documentObject.spentUsd) < Number(documentObject.budgetUsd);

		if (!isBudgetAvailable) {
			return;
		}

		const preset = documentObject.preset;
		const modelId = preset.settings.model || null;
		const outputSchema = preset.outputSchema || null;

		const result = await this.transcriptionService.rederiveStructured({
			modelId,
			outputSchema,
			text,
			transcriptionStructured,
		});

		if (!result) {
			return;
		}

		if (result.costUsd) {
			await this.documentRepository.updateSpentUsd(
				documentObject.id,
				result.costUsd,
				trx,
			);
		}

		if (result.structured) {
			await this.transcriptionRepository.updateEditedStructured(
				transcriptionId,
				result.structured,
				trx,
			);
		}
	}

	public async getDebug(
		pageId: number,
		userId: number,
	): Promise<PageDebugResponseDto> {
		const page = await this.pageRepository.findByIdForOwner(pageId, userId);

		if (!page) {
			throw new HTTPError({
				message: PageErrorMessage.PAGE_NOT_FOUND,
				status: HTTPCode.NOT_FOUND,
			});
		}

		const transcription =
			await this.transcriptionRepository.findCurrentDebugByPageId(pageId);

		if (!transcription) {
			throw new HTTPError({
				message: PageErrorMessage.TRANSCRIPTION_UNAVAILABLE,
				status: HTTPCode.NOT_FOUND,
			});
		}

		const { presetId, presetVersion } = transcription;

		return {
			contextUsed: transcription.contextUsed,
			costUsd: transcription.costUsd,
			fromCache: transcription.fromCache,
			inputTokens: transcription.inputTokens,
			latencyMs: transcription.latencyMs,
			model: transcription.model,
			outputTokens: transcription.outputTokens,
			pageId: transcription.pageId,
			preset:
				presetId === null || presetVersion === null
					? null
					: {
							id: presetId,
							version: presetVersion,
						},
			prompt: transcription.prompt,
			provider: transcription.provider,
			rawResponse: transcription.rawResponse,
			transcriptionId: transcription.transcriptionId,
		};
	}

	public async reprocess({
		pageId,
		userId,
	}: ReprocessPagePayload): Promise<void> {
		const page = await this.pageRepository.findByIdForOwner(pageId, userId);

		if (!page) {
			throw new HTTPError({
				message: PageErrorMessage.PAGE_NOT_FOUND,
				status: HTTPCode.NOT_FOUND,
			});
		}

		if (page.status !== PageStatus.FAILED) {
			throw new HTTPError({
				message: PageErrorMessage.PAGE_NOT_FAILED,
				status: HTTPCode.CONFLICT,
			});
		}

		const wasReset = await this.pageRepository.resetFailedPageForReprocess(
			page.id,
		);

		if (!wasReset) {
			throw new HTTPError({
				message: PageErrorMessage.PAGE_NOT_FAILED,
				status: HTTPCode.CONFLICT,
			});
		}

		try {
			await this.pageTranscribeQueue.add({
				documentId: page.documentId,
				pageId: page.id,
				pageNo: page.pageNo,
			});
		} catch (error) {
			await this.pageRepository.restoreFailedPageAfterReprocessFailure(
				page.id,
				page.attempts,
				page.lastError,
			);

			this.logger.error(
				`Failed to enqueue reprocess job for page ${String(page.id)}`,
				{ error },
			);

			throw new HTTPError({
				message: PageErrorMessage.REPROCESS_FAILED,
				status: HTTPCode.INTERNAL_SERVER_ERROR,
			});
		}
	}

	public async verify(
		payload: VerifyPagePayload,
	): Promise<VerifyPageResponseDto> {
		const { action, pageId, transcriptionId, userId } = payload;

		const isCorrection = action === PageVerificationAction.CORRECT;

		const isVerifiedAction = action !== PageVerificationAction.SKIP;

		if (isCorrection && !payload.text) {
			throw new HTTPError({
				message: PageErrorMessage.TEXT_REQUIRED_FOR_CORRECTION,
				status: HTTPCode.UNPROCESSED_ENTITY,
			});
		}

		const status = StatusByAction[action];

		try {
			const result = await DocumentModel.transaction(async (trx) => {
				let page = await this.pageRepository.findByIdForOwner(
					pageId,
					userId,
					trx,
				);

				if (!page) {
					throw new HTTPError({
						message: PageErrorMessage.PAGE_NOT_FOUND,
						status: HTTPCode.NOT_FOUND,
					});
				}

				const document =
					await this.documentRepository.findByIdAndOwnerIdWithPresetForUpdate(
						page.documentId,
						userId,
						trx,
					);
				page = await this.pageRepository.findByIdForOwner(pageId, userId, trx);

				if (!document || !page) {
					throw new HTTPError({
						message: PageErrorMessage.PAGE_NOT_FOUND,
						status: HTTPCode.NOT_FOUND,
					});
				}

				const transcription =
					await this.transcriptionRepository.findCurrentByPageId(pageId, trx);

				if (!transcription || transcription.id !== transcriptionId) {
					throw new HTTPError({
						message: PageErrorMessage.TRANSCRIPTION_NOT_FOUND,
						status: HTTPCode.CONFLICT,
					});
				}

				const existingEvent =
					await this.pageEventRepository.findVerificationEvent(
						{
							event: action,
							pageId,
							transcriptionId,
						},
						trx,
					);

				if (existingEvent && !isCorrection) {
					return {
						pagesToQueue: [],
						response: await this.buildVerifyResponse(
							{
								documentId: page.documentId,
								pageId,
								pageNo: page.pageNo,
								status: page.status,
							},
							trx,
						),
					};
				}

				if (isCorrection) {
					await this.handleCorrection({
						document,
						text: payload.text,
						transcriptionId,
						transcriptionStructured: transcription.structured,
						trx,
					});
				}

				const verifiedAt = isVerifiedAction ? new Date().toISOString() : null;

				await this.pageRepository.updateVerification(
					{
						pageId,
						status,
						verifiedAt,
						verifiedBy: isVerifiedAction ? userId : null,
					},
					trx,
				);

				if (!existingEvent) {
					await this.pageEventRepository.createVerificationEvent(
						{
							actorId: userId,
							documentId: page.documentId,
							durationMs: payload.durationMs,
							event: action,
							pageId,
							transcriptionId,
						},
						trx,
					);
				}

				const nextPageNo = page.pageNo + NUMBER_OF_PAGES_TO_INCREMENT;

				await this.documentRepository.updateCursorPageNo(
					page.documentId,
					nextPageNo,
					trx,
				);

				const shouldAdvanceWindow = !CLOSED_PAGE_STATUSES.has(page.status);
				const pagesToQueue = shouldAdvanceWindow
					? await refillPageWindow({
							documentId: page.documentId,
							pageRepository: this.pageRepository,
							quantity: NUMBER_OF_PAGES_TO_INCREMENT,
							trx,
						})
					: [];

				await this.documentRepository.markDoneIfAllPagesClosed(
					page.documentId,
					trx,
				);

				return {
					pagesToQueue,
					response: await this.buildVerifyResponse(
						{
							documentId: page.documentId,
							pageId,
							pageNo: page.pageNo,
							status,
						},
						trx,
					),
				};
			});

			await Promise.all(
				result.pagesToQueue.map((page) => {
					const { documentId, id, pageNo } = page.toObject();

					return this.pageTranscribeQueue.add({
						documentId,
						pageId: id,
						pageNo,
					});
				}),
			);

			return result.response;
		} catch (error) {
			if (
				error instanceof UniqueViolationError &&
				error.constraint === PageErrorType.PAGE_EVENT_ONCE
			) {
				const page = await this.pageRepository.findByIdForOwner(pageId, userId);

				if (!page) {
					throw new HTTPError({
						message: PageErrorMessage.PAGE_NOT_FOUND,
						status: HTTPCode.NOT_FOUND,
					});
				}

				return await this.buildVerifyResponse({
					documentId: page.documentId,
					pageId,
					pageNo: page.pageNo,
					status: page.status,
				});
			}
			throw error;
		}
	}
}

export { PageService };
