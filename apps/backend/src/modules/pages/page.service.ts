import {
	HTTPCode,
	HTTPError,
	type PageDebugResponseDto,
	PageStatus,
	PageVerificationAction,
	type UndoPageResponseDto,
	type VerifyPageResponseDto,
} from "@transcripta/shared";
import { type Transaction, UniqueViolationError } from "objection";

import { type Logger } from "~/libs/modules/logger/logger.js";
import { type PageTranscribeQueue } from "~/libs/modules/queue/page-transcribe-queue.module.js";
import { RederiveStructuredQueue } from "~/libs/modules/queue/queue.js";
import {
	buildContextWords,
	extractLexiconIds,
	mapPageLexicons,
} from "~/modules/transcription/libs/helpers/helpers.js";
import { TranscriptionModel } from "~/modules/transcription/transcription.model.js";

import { DocumentEntity } from "../documents/document.entity.js";
import { DocumentModel } from "../documents/document.model.js";
import { type DocumentRepository } from "../documents/document.repository.js";
import { type TranscriptionRepository } from "../transcription/transcription.repository.js";
import { TranscriptionService } from "../transcription/transcription.service.js";
import {
	CLOSED_PAGE_STATUSES,
	NUMBER_OF_PAGES_TO_INCREMENT,
	PAGE_EVENT_ATTEMPT_INCREMENT,
	PAGE_STATUS_BY_ACTION,
	REPROCESSABLE_PAGE_STATUSES,
	UNDOABLE_PAGE_STATUSES,
} from "./libs/constants/constants.js";
import { PageErrorMessage, PageErrorType } from "./libs/enums/enums.js";
import { refillPageWindow } from "./libs/helpers/helpers.js";
import {
	type BuildVerifyResponsePayload,
	type PageServiceDependencies,
	type ReprocessPagePayload,
	type ResolveTranscriptionForVerifyPayload,
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

	private rederiveStructuredQueue: RederiveStructuredQueue;

	private transcriptionRepository: TranscriptionRepository;

	private transcriptionService: TranscriptionService;

	public constructor({
		documentRepository,
		logger,
		pageEventRepository,
		pageRepository,
		pageTranscribeQueue,
		rederiveStructuredQueue,
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
		this.rederiveStructuredQueue = rederiveStructuredQueue;
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
		const text = nextTranscription?.editedText ?? nextTranscription?.text ?? "";
		const contextUsed = nextTranscription?.contextUsed ?? null;
		const lexiconRows = await this.documentRepository.findLexiconByIds(
			extractLexiconIds(contextUsed),
			trx,
		);
		const lexiconById = new Map(lexiconRows.map((row) => [row.id, row]));
		const pageLexiconById = mapPageLexicons(contextUsed, lexiconById);

		return {
			lexiconAdded: [],
			next: {
				pageId: nextPage.id,
				pageNo: nextPage.pageNo,
				status: nextPage.status,
				transcription: nextTranscription
					? {
							contextWords: buildContextWords({
								lexiconById: pageLexiconById,
								text,
							}),
							text,
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
		transcription,
		trx,
	}: {
		document: DocumentEntity;
		text: string;
		transcription: TranscriptionModel;
		trx: Transaction;
	}): Promise<boolean> {
		const transcriptionText = transcription.editedText ?? transcription.text;
		const documentObject = document.toObjectWithPreset();

		if (
			transcriptionText === text &&
			documentObject.presetId === transcription.presetId &&
			transcription.editedStructured !== null
		) {
			return false;
		}

		if (transcriptionText !== text) {
			await this.transcriptionRepository.updateEditedText(
				transcription.id,
				text,
				trx,
			);
		}

		return true;
	}

	private async resolveTranscriptionForVerify({
		action,
		document,
		page,
		pageId,
		text,
		transcriptionId,
		trx,
	}: ResolveTranscriptionForVerifyPayload): Promise<TranscriptionModel> {
		const existingTranscription =
			await this.transcriptionRepository.findCurrentByPageId(pageId, trx);

		if (existingTranscription) {
			if (
				transcriptionId === undefined ||
				existingTranscription.id !== transcriptionId
			) {
				throw new HTTPError({
					message: PageErrorMessage.TRANSCRIPTION_NOT_FOUND,
					status: HTTPCode.CONFLICT,
				});
			}

			return existingTranscription;
		}

		if (page.status !== PageStatus.FAILED) {
			throw new HTTPError({
				message: PageErrorMessage.MANUAL_TRANSCRIPTION_NOT_ALLOWED,
				status: HTTPCode.CONFLICT,
			});
		}

		if (action !== PageVerificationAction.CORRECT || !text) {
			throw new HTTPError({
				message: PageErrorMessage.TEXT_REQUIRED_FOR_CORRECTION,
				status: HTTPCode.UNPROCESSED_ENTITY,
			});
		}

		if (transcriptionId !== undefined) {
			throw new HTTPError({
				message: PageErrorMessage.TRANSCRIPTION_NOT_FOUND,
				status: HTTPCode.CONFLICT,
			});
		}

		const { presetId } = document.toObjectWithPreset();

		return await this.transcriptionRepository.createManual(
			{
				documentId: page.documentId,
				pageId,
				presetId,
				text,
			},
			trx,
		);
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

		if (!REPROCESSABLE_PAGE_STATUSES.has(page.status)) {
			throw new HTTPError({
				message: PageErrorMessage.PAGE_NOT_REPROCESSABLE,
				status: HTTPCode.CONFLICT,
			});
		}

		const originalStatus = page.status;

		await DocumentModel.transaction(async (trx) => {
			const wasReset = await this.pageRepository.resetPageForReprocess(
				page.id,
				trx,
			);

			if (!wasReset) {
				throw new HTTPError({
					message: PageErrorMessage.PAGE_NOT_REPROCESSABLE,
					status: HTTPCode.CONFLICT,
				});
			}

			await this.documentRepository.markProcessingIfDone(page.documentId, trx);
		});

		try {
			await this.pageTranscribeQueue.add({
				documentId: page.documentId,
				pageId: page.id,
				pageNo: page.pageNo,
			});
		} catch (error) {
			await DocumentModel.transaction(async (trx) => {
				await this.pageRepository.restorePage({
					attempts: page.attempts,
					lastError: page.lastError,
					pageId: page.id,
					status: originalStatus,
					trx,
				});

				await this.documentRepository.markDoneIfAllPagesClosed(
					page.documentId,
					trx,
				);
			});

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

	public async undo(
		pageId: number,
		userId: number,
	): Promise<UndoPageResponseDto> {
		return await DocumentModel.transaction(async (trx) => {
			const initialPage = await this.pageRepository.findByIdForOwner(
				pageId,
				userId,
				trx,
			);

			if (!initialPage) {
				throw new HTTPError({
					message: PageErrorMessage.PAGE_NOT_FOUND,
					status: HTTPCode.NOT_FOUND,
				});
			}

			const document =
				await this.documentRepository.findByIdAndOwnerIdForUpdate(
					initialPage.documentId,
					userId,
					trx,
				);
			const page = await this.pageRepository.findByIdForOwner(
				pageId,
				userId,
				trx,
			);

			if (!document || !page) {
				throw new HTTPError({
					message: PageErrorMessage.PAGE_NOT_FOUND,
					status: HTTPCode.NOT_FOUND,
				});
			}

			if (!UNDOABLE_PAGE_STATUSES.has(page.status)) {
				throw new HTTPError({
					message: PageErrorMessage.PAGE_NOT_VERIFIED,
					status: HTTPCode.CONFLICT,
				});
			}

			const transcription =
				await this.transcriptionRepository.findCurrentByPageId(pageId, trx);

			if (!transcription) {
				throw new HTTPError({
					message: PageErrorMessage.TRANSCRIPTION_NOT_FOUND,
					status: HTTPCode.CONFLICT,
				});
			}

			const attempt =
				(await this.pageEventRepository.findLatestAttempt(pageId, trx)) +
				PAGE_EVENT_ATTEMPT_INCREMENT;

			await this.pageRepository.updateVerification(
				{
					pageId,
					status: PageStatus.TRANSCRIBED,
					verifiedAt: null,
					verifiedBy: null,
				},
				trx,
			);

			await this.pageEventRepository.createUndoEvent(
				{
					actorId: userId,
					attempt,
					documentId: page.documentId,
					pageId,
					transcriptionId: transcription.id,
				},
				trx,
			);

			await this.documentRepository.setCursorPageNo(
				page.documentId,
				page.pageNo,
				trx,
			);
			await this.documentRepository.markProcessingIfDone(page.documentId, trx);

			return {
				pageId,
				status: PageStatus.TRANSCRIBED,
				transcription: {
					contextWords: [],
					id: transcription.id,
					structured: transcription.structured,
					text: transcription.text,
				},
			};
		});
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

		const status = PAGE_STATUS_BY_ACTION[action];

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

				const transcription = await this.resolveTranscriptionForVerify({
					action,
					document,
					page,
					pageId,
					text: payload.text,
					transcriptionId,
					trx,
				});

				const attempt = await this.pageEventRepository.findLatestAttempt(
					pageId,
					trx,
				);

				const existingEvent =
					await this.pageEventRepository.findVerificationEvent(
						{
							attempt,
							event: action,
							pageId,
							transcriptionId: transcription.id,
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

				let needRederiveStructured = false;
				if (isCorrection && payload.text) {
					needRederiveStructured = await this.handleCorrection({
						document,
						text: payload.text,
						transcription,
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
							attempt,
							documentId: page.documentId,
							durationMs: payload.durationMs,
							event: action,
							pageId,
							transcriptionId: transcription.id,
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
					documentId: page.documentId,
					needRederiveStructured,
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
					transcriptionId: transcription.id,
				};
			});

			if (result.needRederiveStructured && payload.text) {
				await this.rederiveStructuredQueue.add({
					currentTranscriptionId: result.transcriptionId,
					documentId: result.documentId,
					pageId,
					text: payload.text,
				});
			}

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
