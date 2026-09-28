import {
	EMPTY_LENGTH,
	HTTPCode,
	HTTPError,
	type LexiconInvalidateResponseDto,
	PageStatus,
} from "@transcripta/shared";

import { LexiconEntryModel } from "~/modules/lexicon/lexicon-entry.model.js";

import { type LexiconRepository } from "./lexicon.repository.js";
import { LexiconErrorMessage } from "./libs/enums/enums.js";
import { type LexiconServiceDependencies } from "./libs/types/types.js";

class LexiconService {
	private lexiconRepository: LexiconRepository;

	private pageTranscribeQueue: LexiconServiceDependencies["pageTranscribeQueue"];

	public constructor({
		lexiconRepository,
		pageTranscribeQueue,
	}: LexiconServiceDependencies) {
		this.lexiconRepository = lexiconRepository;
		this.pageTranscribeQueue = pageTranscribeQueue;
	}

	public async invalidate({
		lexiconId,
		ownerId,
		reason,
	}: {
		lexiconId: number;
		ownerId: number;
		reason: string;
	}): Promise<LexiconInvalidateResponseDto> {
		const entry = await this.lexiconRepository.findOwnedById(
			lexiconId,
			ownerId,
		);

		if (!entry) {
			throw new HTTPError({
				message: LexiconErrorMessage.NOT_FOUND,
				status: HTTPCode.NOT_FOUND,
			});
		}

		if (entry.invalidatedAt !== null) {
			throw new HTTPError({
				message: LexiconErrorMessage.ALREADY_INVALIDATED,
				status: HTTPCode.CONFLICT,
			});
		}

		const { pagesQueuedForReprocess, pagesToEnqueue, verifiedPagesFlagged } =
			await LexiconEntryModel.transaction(async (trx) => {
				const wasInvalidated = await this.lexiconRepository.invalidate(
					lexiconId,
					reason,
					trx,
				);

				if (!wasInvalidated) {
					throw new HTTPError({
						message: LexiconErrorMessage.ALREADY_INVALIDATED,
						status: HTTPCode.CONFLICT,
					});
				}

				const affectedPages =
					await this.lexiconRepository.findAffectedPagesByLexiconId(
						entry.documentId,
						lexiconId,
						trx,
					);

				const transcribedPages = affectedPages.filter(
					(page) => page.status === PageStatus.TRANSCRIBED,
				);
				const verifiedPages = affectedPages.filter(
					(page) =>
						page.status === PageStatus.CONFIRMED ||
						page.status === PageStatus.CORRECTED,
				);

				const queuedCount = await this.lexiconRepository.queueTranscribedPages(
					transcribedPages.map((page) => page.id),
					trx,
				);

				const flaggedCount = await this.lexiconRepository.flagVerifiedPages(
					verifiedPages,
					lexiconId,
					trx,
				);

				return {
					pagesQueuedForReprocess: queuedCount,
					pagesToEnqueue: transcribedPages,
					verifiedPagesFlagged: flaggedCount,
				};
			});

		if (pagesToEnqueue.length > EMPTY_LENGTH) {
			try {
				await Promise.all(
					pagesToEnqueue.map((page) =>
						this.pageTranscribeQueue.add({
							documentId: page.documentId,
							pageId: page.id,
							pageNo: page.pageNo,
						}),
					),
				);
			} catch {
				await this.lexiconRepository.restoreAfterInvalidateEnqueueFailure({
					lexiconId,
					pageIds: pagesToEnqueue.map((page) => page.id),
				});

				throw new HTTPError({
					message: LexiconErrorMessage.REPROCESS_ENQUEUE_FAILED,
					status: HTTPCode.INTERNAL_SERVER_ERROR,
				});
			}
		}

		return {
			invalidatedId: lexiconId,
			pagesQueuedForReprocess,
			verifiedPagesFlagged,
		};
	}
}

export { LexiconService };
