import {
	HTTPCode,
	HTTPError,
	PageVerificationAction,
	type VerifyPageResponseDto,
} from "@transcripta/shared";
import { type Transaction, UniqueViolationError } from "objection";

import { DocumentModel } from "../documents/document.model.js";
import { type DocumentRepository } from "../documents/document.repository.js";
import { type TranscriptionRepository } from "../transcription/transcription.repository.js";
import {
	NUMBER_OF_PAGES_TO_INCREMENT,
	statusByAction,
} from "./libs/constants/constants.js";
import { PageErrorMessage, PageErrorType } from "./libs/enums/enums.js";
import {
	type BuildVerifyResponsePayload,
	type PageServiceDependencies,
	type VerifyPagePayload,
} from "./libs/types/types.js";
import { type PageEventRepository } from "./page-event/page-event.repository.js";
import { type PageRepository } from "./page.repository.js";

class PageService {
	private documentRepository: DocumentRepository;

	private pageEventRepository: PageEventRepository;

	private pageRepository: PageRepository;

	private transcriptionRepository: TranscriptionRepository;

	public constructor({
		documentRepository,
		pageEventRepository,
		pageRepository,
		transcriptionRepository,
	}: PageServiceDependencies) {
		this.pageRepository = pageRepository;
		this.transcriptionRepository = transcriptionRepository;
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
							text: nextTranscription.text,
						}
					: null,
			},
			pageId,
			status,
		};
	}

	public async verify(
		payload: VerifyPagePayload,
	): Promise<VerifyPageResponseDto> {
		const { action, pageId, transcriptionId, userId } = payload;
		try {
			return await DocumentModel.transaction(async (trx) => {
				const page = await this.pageRepository.findByIdForOwner(
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

				if (existingEvent) {
					return await this.buildVerifyResponse(
						{
							documentId: page.documentId,
							pageId,
							pageNo: page.pageNo,
							status: statusByAction[action],
						},
						trx,
					);
				}

				const status = statusByAction[action];

				const verifiedAt = new Date().toISOString();

				if (action === PageVerificationAction.CORRECT) {
					await this.transcriptionRepository.updateEditedText(
						transcription.id,
						payload.text,
						trx,
					);
				}

				await this.pageRepository.updateVerification(
					{
						pageId,
						status,
						verifiedAt,
						verifiedBy: userId,
					},
					trx,
				);

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

				const nextPageNo = page.pageNo + NUMBER_OF_PAGES_TO_INCREMENT;

				await this.documentRepository.updateCursorPageNo(
					page.documentId,
					nextPageNo,
					trx,
				);

				return await this.buildVerifyResponse(
					{
						documentId: page.documentId,
						pageId,
						pageNo: page.pageNo,
						status,
					},
					trx,
				);
			});
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
					status: statusByAction[action],
				});
			}
			throw error;
		}
	}
}

export { PageService };
