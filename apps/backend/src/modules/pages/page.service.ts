import {
	HTTPCode,
	HTTPError,
	type PageDebugResponseDto,
	PageStatus,
	PageVerificationAction,
	type PageVerificationActionValue,
	type UndoPageResponseDto,
	type VerifyPageLexiconItemDto,
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

import { DEFAULT_PRESET_SETTINGS } from "../context/builder/libs/constants/constants.js";
import { DocumentEntity } from "../documents/document.entity.js";
import { DocumentModel } from "../documents/document.model.js";
import { type DocumentRepository } from "../documents/document.repository.js";
import { type LexiconUpdateService } from "../lexicon/lexicon-update.service.js";
import { type TranscriptionModel } from "../transcription/transcription.model.js";
import { type TranscriptionRepository } from "../transcription/transcription.repository.js";
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
import { type PageEventModel } from "./page-event/page-event.model.js";
import { type PageEventRepository } from "./page-event/page-event.repository.js";
import { type PageEntity } from "./page.entity.js";
import { type PageModel } from "./page.model.js";
import { type PageRepository } from "./page.repository.js";

class PageService {
	private documentRepository: DocumentRepository;

	private lexiconUpdateService: LexiconUpdateService;

	private logger: Logger;

	private pageEventRepository: PageEventRepository;

	private pageRepository: PageRepository;

	private pageTranscribeQueue: PageTranscribeQueue;

	private rederiveStructuredQueue: RederiveStructuredQueue;

	private transcriptionRepository: TranscriptionRepository;

	public constructor({
		documentRepository,
		lexiconUpdateService,
		logger,
		pageEventRepository,
		pageRepository,
		pageTranscribeQueue,
		rederiveStructuredQueue,
		transcriptionRepository,
	}: PageServiceDependencies) {
		this.pageRepository = pageRepository;
		this.logger = logger;
		this.lexiconUpdateService = lexiconUpdateService;
		this.pageTranscribeQueue = pageTranscribeQueue;
		this.rederiveStructuredQueue = rederiveStructuredQueue;
		this.transcriptionRepository = transcriptionRepository;
		this.pageEventRepository = pageEventRepository;
		this.documentRepository = documentRepository;
	}

	private async applyVerificationUpdate({
		action,
		attempt,
		documentId,
		durationMs,
		existingEvent,
		isVerifiedAction,
		pageId,
		status,
		transcriptionId,
		trx,
		userId,
	}: {
		action: PageVerificationActionValue;
		attempt: number;
		documentId: number;
		durationMs: number;
		existingEvent: PageEventModel | undefined;
		isVerifiedAction: boolean;
		pageId: number;
		status: PageModel["status"];
		transcriptionId: number;
		trx: Transaction;
		userId: number;
	}): Promise<void> {
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
					documentId,
					durationMs,
					event: action,
					pageId,
					transcriptionId,
				},
				trx,
			);
		}
	}

	private assertCorrectionTextProvided(payload: VerifyPagePayload): void {
		const isCorrection = payload.action === PageVerificationAction.CORRECT;

		if (isCorrection && !payload.text) {
			throw new HTTPError({
				message: PageErrorMessage.TEXT_REQUIRED_FOR_CORRECTION,
				status: HTTPCode.UNPROCESSED_ENTITY,
			});
		}
	}

	private async buildVerifyResponse(
		payload: BuildVerifyResponsePayload,
		trx?: Transaction,
	): Promise<VerifyPageResponseDto> {
		const { documentId, lexiconAdded, pageId, pageNo, status } = payload;

		const nextPageNo = pageNo + NUMBER_OF_PAGES_TO_INCREMENT;

		const nextPage = await this.pageRepository.findByDocumentAndPageNo(
			documentId,
			nextPageNo,
			trx,
		);

		if (!nextPage) {
			return {
				lexiconAdded,
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
			lexiconAdded,
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

	private async buildVerifyResponseForReplay({
		pageId,
		userId,
	}: {
		pageId: number;
		userId: number;
	}): Promise<VerifyPageResponseDto> {
		const page = await this.pageRepository.findByIdForOwner(pageId, userId);

		if (!page) {
			throw new HTTPError({
				message: PageErrorMessage.PAGE_NOT_FOUND,
				status: HTTPCode.NOT_FOUND,
			});
		}

		return await this.buildVerifyResponse({
			documentId: page.documentId,
			lexiconAdded: [],
			pageId,
			pageNo: page.pageNo,
			status: page.status,
		});
	}

	private async enqueuePages(pagesToQueue: PageEntity[]): Promise<void> {
		await Promise.all(
			pagesToQueue.map((page) => {
				const { documentId, id, pageNo } = page.toObject();

				return this.pageTranscribeQueue.add({
					documentId,
					pageId: id,
					pageNo,
				});
			}),
		);
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

	private async loadClaimedEntities({
		action,
		pageId,
		text,
		transcriptionId,
		trx,
		userId,
	}: {
		action: PageVerificationActionValue;
		pageId: number;
		text: string | undefined;
		transcriptionId: number | undefined;
		trx: Transaction;
		userId: number;
	}): Promise<{
		document: DocumentEntity;
		page: PageModel;
		transcription: TranscriptionModel;
	}> {
		let page = await this.pageRepository.findByIdForOwner(pageId, userId, trx);

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
			text,
			transcriptionId,
			trx,
		});

		return { document, page, transcription };
	}

	private async loadVerificationState({
		action,
		pageId,
		transcriptionId,
		trx,
	}: {
		action: PageVerificationActionValue;
		pageId: number;
		transcriptionId: number;
		trx: Transaction;
	}): Promise<{
		attempt: number;
		existingEvent: PageEventModel | undefined;
	}> {
		const attempt = await this.pageEventRepository.findLatestAttempt(
			pageId,
			trx,
		);
		const existingEvent = await this.pageEventRepository.findVerificationEvent(
			{
				attempt,
				event: action,
				pageId,
				transcriptionId,
			},
			trx,
		);

		return { attempt, existingEvent };
	}

	private async refillWindowIfAdvanced({
		documentId,
		pageStatus,
		trx,
	}: {
		documentId: number;
		pageStatus: PageModel["status"];
		trx: Transaction;
	}): Promise<PageEntity[]> {
		const shouldAdvanceWindow = !CLOSED_PAGE_STATUSES.has(pageStatus);

		if (!shouldAdvanceWindow) {
			return [];
		}

		return await refillPageWindow({
			documentId,
			pageRepository: this.pageRepository,
			quantity: NUMBER_OF_PAGES_TO_INCREMENT,
			trx,
		});
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

	private async verifyWithinTransaction({
		action,
		durationMs,
		isCorrection,
		isVerifiedAction,
		pageId,
		status,
		text,
		transcriptionId,
		trx,
		userId,
	}: {
		action: PageVerificationActionValue;
		durationMs: number;
		isCorrection: boolean;
		isVerifiedAction: boolean;
		pageId: number;
		status: PageModel["status"];
		text: string | undefined;
		transcriptionId: number | undefined;
		trx: Transaction;
		userId: number;
	}): Promise<{
		documentId: number;
		needRederiveStructured: boolean;
		pageNo: number;
		pagesToQueue: PageEntity[];
		response: VerifyPageResponseDto;
		transcriptionId: number;
	}> {
		const { document, page, transcription } = await this.loadClaimedEntities({
			action,
			pageId,
			text,
			transcriptionId,
			trx,
			userId,
		});
		const { attempt, existingEvent } = await this.loadVerificationState({
			action,
			pageId,
			transcriptionId: transcription.id,
			trx,
		});

		if (existingEvent && !isCorrection) {
			return {
				documentId: page.documentId,
				needRederiveStructured: false,
				pageNo: page.pageNo,
				pagesToQueue: await this.pageRepository.findQueuedPages(
					page.documentId,
					trx,
				),
				response: await this.buildVerifyResponse(
					{
						documentId: page.documentId,
						lexiconAdded: [],
						pageId,
						pageNo: page.pageNo,
						status: page.status,
					},
					trx,
				),
				transcriptionId: transcription.id,
			};
		}

		const needRederiveStructured =
			isCorrection && text
				? await this.handleCorrection({
						document,
						text,
						transcription,
						trx,
					})
				: false;

		let lexiconAdded: VerifyPageLexiconItemDto[] = [];

		const { preset } = document.toObjectWithPreset();

		const minDistinctPages =
			preset.settings?.minDistinctPages ??
			DEFAULT_PRESET_SETTINGS.minDistinctPages;
		const outputSchema = preset.outputSchema;

		if (action === PageVerificationAction.CONFIRM && !existingEvent) {
			lexiconAdded =
				await this.lexiconUpdateService.updateLexiconFromVerifiedPage({
					documentId: page.documentId,
					minDistinctPages,
					outputSchema,
					pageNo: page.pageNo,
					structured: transcription.structured,
					text: transcription.text,
					trx,
				});
		}

		await this.applyVerificationUpdate({
			action,
			attempt,
			documentId: page.documentId,
			durationMs,
			existingEvent,
			isVerifiedAction,
			pageId,
			status,
			transcriptionId: transcription.id,
			trx,
			userId,
		});

		const nextPageNo = page.pageNo + NUMBER_OF_PAGES_TO_INCREMENT;

		await this.documentRepository.updateCursorPageNo(
			page.documentId,
			nextPageNo,
			trx,
		);
		const pagesToQueue = await this.refillWindowIfAdvanced({
			documentId: page.documentId,
			pageStatus: page.status,
			trx,
		});

		await this.documentRepository.markDoneIfAllPagesClosed(
			page.documentId,
			trx,
		);

		return {
			documentId: page.documentId,
			needRederiveStructured,
			pageNo: page.pageNo,
			pagesToQueue,
			response: await this.buildVerifyResponse(
				{
					documentId: page.documentId,
					lexiconAdded,
					pageId,
					pageNo: page.pageNo,
					status,
				},
				trx,
			),
			transcriptionId: transcription.id,
		};
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

			const text = transcription.editedText ?? transcription.text;
			const lexiconRows = await this.documentRepository.findLexiconByIds(
				extractLexiconIds(transcription.contextUsed),
				trx,
			);
			const lexiconById = new Map(lexiconRows.map((row) => [row.id, row]));
			const pageLexiconById = mapPageLexicons(
				transcription.contextUsed,
				lexiconById,
			);

			return {
				pageId,
				status: PageStatus.TRANSCRIBED,
				transcription: {
					contextWords: buildContextWords({
						lexiconById: pageLexiconById,
						text,
					}),
					id: transcription.id,
					structured:
						transcription.editedStructured ?? transcription.structured,
					text,
				},
			};
		});
	}

	public async verify(
		payload: VerifyPagePayload,
	): Promise<VerifyPageResponseDto> {
		this.assertCorrectionTextProvided(payload);

		const { action, pageId, transcriptionId, userId } = payload;
		const status = PAGE_STATUS_BY_ACTION[action];

		try {
			const result = await DocumentModel.transaction(
				async (trx) =>
					await this.verifyWithinTransaction({
						action,
						durationMs: payload.durationMs,
						isCorrection: action === PageVerificationAction.CORRECT,
						isVerifiedAction: action !== PageVerificationAction.SKIP,
						pageId,
						status,
						text: payload.text,
						transcriptionId,
						trx,
						userId,
					}),
			);

			if (result.needRederiveStructured && payload.text) {
				await this.rederiveStructuredQueue.add({
					currentTranscriptionId: result.transcriptionId,
					documentId: result.documentId,
					pageId,
					pageNo: result.pageNo,
					text: payload.text,
				});
			}

			await this.enqueuePages(result.pagesToQueue);

			return result.response;
		} catch (error) {
			if (
				error instanceof UniqueViolationError &&
				error.constraint === PageErrorType.PAGE_EVENT_ONCE
			) {
				return await this.buildVerifyResponseForReplay({
					pageId,
					userId,
				});
			}

			throw error;
		}
	}
}

export { PageService };
