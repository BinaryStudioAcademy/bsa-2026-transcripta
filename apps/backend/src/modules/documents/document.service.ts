import {
	ContentType,
	type DocumentCreateRequestDto,
	type DocumentCreateResponseDto,
	type DocumentGetPagesContextWordResponseDto,
	type DocumentGetPagesResponseDto,
	HTTPCode,
	HTTPError,
} from "@transcripta/shared";
import { createHash } from "node:crypto";
import { ForeignKeyViolationError } from "objection";

import { type Logger } from "~/libs/modules/logger/logger.js";
import { PDFPageProcessor } from "~/libs/modules/pdf-page-processor/pdf-page-processor.js";
import { type PageTranscribeQueue } from "~/libs/modules/queue/page-transcribe-queue.module.js";
import { type BaseStorage } from "~/libs/modules/storage/base-storage.module.js";
import { StorageBucket } from "~/libs/modules/storage/storage.js";
import { type PageWithTranscriptionRow } from "~/modules/pages/libs/types/types.js";

import { PageEntity } from "../pages/page.entity.js";
import { type PageRepository } from "../pages/page.repository.js";
import { DocumentEntity } from "./document.entity.js";
import { DocumentModel } from "./document.model.js";
import { type DocumentRepository } from "./document.repository.js";
import {
	DOCUMENT_OWNER_ID_FOREIGN,
	EMPTY_COLLECTION_LENGTH,
	MAX_DOCUMENT_PAGES,
	NON_DELETABLE_DOCUMENT_STATUSES,
	NOT_FOUND_INDEX,
	PAGES_TO_QUEUE,
	TWENTY_FOUR_HOURS_IN_MS,
} from "./libs/constants/constants.js";
import {
	DocumentErrorMessage,
	DocumentStatus,
	DocumentValidationMessage,
	PageStatus,
} from "./libs/enums/enums.js";
import {
	type DocumentGetAllResponseDto,
	type DocumentGetByIdResponseDto,
	type DocumentServiceDependencies,
	type DocumentUploadUrlRequestDto,
} from "./libs/types/types.js";

class DocumentService {
	private documentRepository: DocumentRepository;
	private logger: Logger;
	private pageRepository: PageRepository;
	private pageTranscribeQueue: PageTranscribeQueue;
	private pdfPageProcessor: PDFPageProcessor;
	private storage: BaseStorage;

	public constructor({
		documentRepository,
		logger,
		pageRepository,
		pageTranscribeQueue,
		pdfPageProcessor,
		storage,
}: DocumentServiceDependencies) {
		this.documentRepository = documentRepository;
		this.logger = logger;
		this.pageRepository = pageRepository;
		this.pdfPageProcessor = pdfPageProcessor;
		this.storage = storage;
		this.pageTranscribeQueue = pageTranscribeQueue;
	}

	private buildContextWords({
		lexiconById,
		text,
	}: {
		lexiconById: Map<number, { distinctPages: number; valueDisplay: string }>;
		text: string;
	}): DocumentGetPagesContextWordResponseDto[] {
		const contextWords: DocumentGetPagesContextWordResponseDto[] = [];

		for (const [lexiconId, lexicon] of lexiconById) {
			const { valueDisplay } = lexicon;

			if (valueDisplay.length === EMPTY_COLLECTION_LENGTH) {
				continue;
			}

			let searchFrom = 0;

			while (searchFrom <= text.length) {
				const start = text.indexOf(valueDisplay, searchFrom);

				if (start === NOT_FOUND_INDEX) {
					break;
				}

				contextWords.push({
					end: start + valueDisplay.length,
					lexiconId,
					seenOnPages: lexicon.distinctPages,
					start,
					word: valueDisplay,
				});

				searchFrom = start + valueDisplay.length;
			}
		}

		return contextWords;
	}

	private buildPageLexiconMap(
		contextUsed: null | Record<string, unknown>,
		lexiconById: Map<number, { distinctPages: number; valueDisplay: string }>,
	): Map<number, { distinctPages: number; valueDisplay: string }> {
		return new Map(
			this.extractLexiconIds(contextUsed).flatMap((id) => {
				const lexicon = lexiconById.get(id);

				return lexicon ? [[id, lexicon] as const] : [];
			}),
		);
	}

	private buildSourceKey(documentId: number): string {
		return `uploads/${documentId.toString()}/original.pdf`;
	}

	private async cleanupAbandonedDraftsForUser(ownerId: number): Promise<void> {
		const twentyFourHoursAgo = new Date(
			Date.now() - TWENTY_FOUR_HOURS_IN_MS,
		).toISOString();

		const abandonedDrafts =
			await this.documentRepository.findDraftsOlderThanByUser(
				ownerId,
				twentyFourHoursAgo,
			);

		for (const draft of abandonedDrafts) {
			const documentId = draft.toObject().id;

			await this.storage.deleteByPrefix({
				bucket: StorageBucket.UPLOADS,
				prefix: `uploads/${documentId.toString()}/`,
			});

			await DocumentModel.transaction(async (trx) => {
				await this.documentRepository.deleteById(documentId, trx);
			});
		}
	}

	private collectLexiconIds(pages: PageWithTranscriptionRow[]): number[] {
		const lexiconIds = new Set<number>();

		for (const page of pages) {
			for (const id of this.extractLexiconIds(page.transcriptionContextUsed)) {
				lexiconIds.add(id);
			}
		}

		return [...lexiconIds];
	}

	private async downloadDocument(
		documentId: number,
		sourceKey: string,
	): Promise<{
		clear: () => Promise<void>;
		filePath: string;
	}> {
		let clear: () => Promise<void>;
		let filePath: string;

		try {
			const downloadResult = await this.storage.downloadToTempFolder(sourceKey);
			clear = downloadResult.clear;
			filePath = downloadResult.filePath;
		} catch (error) {
			const caughtErrorMessage =
				error instanceof Error ? error.message : String(error);
			const finalErrorMessage = `${DocumentErrorMessage.DOWNLOAD_FAILED}: ${caughtErrorMessage}`;

			await this.documentRepository.setError(documentId, finalErrorMessage);
			throw new HTTPError({
				message: finalErrorMessage,
				status: HTTPCode.INTERNAL_SERVER_ERROR,
			});
		}

		return { clear, filePath };
	}

	private extractLexiconIds(
		contextUsed: null | Record<string, unknown>,
	): number[] {
		const ids = contextUsed?.["lexiconIds"];

		if (!Array.isArray(ids)) {
			return [];
		}

		return ids.filter((id): id is number => typeof id === "number");
	}

	private async getPresignedUrl(key: null | string): Promise<null | string> {
		if (key === null) {
			return null;
		}

		return await this.storage.getReadSignedUrl(key);
	}

	private async processPage({
		blankStdevThreshold,
		documentId,
		filePath,
		page,
	}: {
		blankStdevThreshold: null | number;
		documentId: number;
		filePath: string;
		page: number;
	}): Promise<void> {
		const { isBlank, pageImage, pageThumbnail } =
			await this.pdfPageProcessor.processPage(
				filePath,
				page,
				blankStdevThreshold ?? null,
			);

		let imageKey: string;
		let thumbnailKey: string;

		try {
			const uploadResult = await this.storage.sendPage({
				documentId,
				page,
				pageImage,
				pageThumbnail,
			});
			imageKey = uploadResult.imageKey;
			thumbnailKey = uploadResult.thumbnailKey;
		} catch (error) {
			const caughtErrorMessage =
				error instanceof Error ? error.message : String(error);
			const finalErrorMessage = `${DocumentErrorMessage.PAGE_UPLOAD_FAILED}: ${caughtErrorMessage}`;

			await this.documentRepository.setError(documentId, finalErrorMessage);
			throw new HTTPError({
				message: finalErrorMessage,
				status: HTTPCode.INTERNAL_SERVER_ERROR,
			});
		}

		const imageSha256 = createHash("sha256").update(pageImage).digest("hex");

		const pageEntity = PageEntity.initializeNew({
			documentId,
			imageKey,
			imageSha256,
			pageNo: page,
			status: isBlank ? PageStatus.BLANK : PageStatus.PENDING,
			thumbKey: thumbnailKey,
		});
		await this.pageRepository.create(pageEntity);
	}

	public async create({
		fileBytes,
		fileName,
		ownerId,
		presetId,
		title,
	}: DocumentCreateRequestDto & {
		ownerId: number;
	}): Promise<DocumentCreateResponseDto> {
		const preset = await this.documentRepository.findAccessiblePreset(
			presetId,
			ownerId,
		);

		if (!preset) {
			throw new HTTPError({
				message: DocumentValidationMessage.PRESET_NOT_FOUND,
				status: HTTPCode.NOT_FOUND,
			});
		}

		try {
			return await DocumentModel.transaction(async (trx) => {
				const documentEntity = DocumentEntity.initializeNew({
					ownerId,
					presetId,
					sourceBytes: fileBytes,
					sourceName: fileName,
					title,
				});

				const createdDocument = await this.documentRepository.create(
					documentEntity,
					trx,
				);
				const document = createdDocument.toObject();

				const sourceKey = this.buildSourceKey(document.id);

				await this.documentRepository.updateSourceKey(
					document.id,
					sourceKey,
					trx,
				);

				const { expiresAt, url: uploadUrl } =
					await this.storage.getUploadSignedUrl({
						contentType: ContentType.PDF,
						key: sourceKey,
					});

				return {
					expiresAt,
					id: document.id,
					status: document.status,
					uploadUrl,
				};
			});
		} catch (error) {
			if (
				error instanceof ForeignKeyViolationError &&
				error.constraint === DOCUMENT_OWNER_ID_FOREIGN
			) {
				throw new HTTPError({
					message: DocumentValidationMessage.USER_NOT_FOUND,
					status: HTTPCode.UNAUTHORIZED,
				});
			}
			throw error;
		}
	}

	public async delete(id: number, ownerId: number): Promise<void> {
		await this.storage.deleteByPrefix({
			bucket: StorageBucket.UPLOADS,
			prefix: `uploads/${id.toString()}/`,
		});
		await this.storage.deleteByPrefix({
			bucket: StorageBucket.PAGES,
			prefix: `pages/${id.toString()}/`,
		});

		await DocumentModel.transaction(async (trx) => {
			const document =
				await this.documentRepository.findByIdAndOwnerIdForUpdate(
					id,
					ownerId,
					trx,
				);

			if (!document) {
				throw new HTTPError({
					message: DocumentValidationMessage.DOCUMENT_NOT_FOUND,
					status: HTTPCode.NOT_FOUND,
				});
			}

			if (NON_DELETABLE_DOCUMENT_STATUSES.has(document.toObject().status)) {
				throw new HTTPError({
					message: DocumentValidationMessage.DOCUMENT_ACTIVE,
					status: HTTPCode.CONFLICT,
				});
			}

			await this.documentRepository.deleteById(id, trx);
		});
	}

	public async findAllByOwnerId(
		ownerId: number,
	): Promise<DocumentGetAllResponseDto> {
		try {
			await this.cleanupAbandonedDraftsForUser(ownerId);
		} catch (error: unknown) {
			this.logger.error(DocumentErrorMessage.DRAFTS_NOT_CLEAN, { error });
		}

		const items = await this.documentRepository.findAllByOwnerId(ownerId);

		return {
			items: items.map((item) => item.toObject()),
		};
	}

	public async findById(
		id: number,
		ownerId: number,
	): Promise<DocumentGetByIdResponseDto> {
		const document = await this.documentRepository.findByIdAndOwnerId(
			id,
			ownerId,
		);

		if (document === null) {
			throw new HTTPError({
				message: DocumentValidationMessage.DOCUMENT_NOT_FOUND,
				status: HTTPCode.NOT_FOUND,
			});
		}
		return document.toObject();
	}

	public async findPages({
		documentId,
		from,
		limit,
		ownerId,
	}: {
		documentId: number;
		from: number;
		limit: number;
		ownerId: number;
	}): Promise<DocumentGetPagesResponseDto> {
		const ownedDocumentId = await this.documentRepository.findOwnedDocumentId(
			documentId,
			ownerId,
		);

		if (ownedDocumentId === null) {
			throw new HTTPError({
				message: DocumentValidationMessage.DOCUMENT_NOT_FOUND,
				status: HTTPCode.NOT_FOUND,
			});
		}

		const pages = await this.pageRepository.findByDocumentId({
			documentId: ownedDocumentId,
			from,
			limit,
		});

		const lexiconRows = await this.documentRepository.findLexiconByIds(
			this.collectLexiconIds(pages),
		);
		const lexiconById = new Map(
			lexiconRows.map((row) => [
				row.id,
				{
					distinctPages: row.distinctPages,
					valueDisplay: row.valueDisplay,
				},
			]),
		);

		const items = await Promise.all(
			pages.map(async (page) => {
				const [imageUrl, thumbUrl] = await Promise.all([
					this.getPresignedUrl(page.imageKey),
					this.getPresignedUrl(page.thumbKey),
				]);

				const text = page.transcriptionText ?? "";
				const pageLexiconById = this.buildPageLexiconMap(
					page.transcriptionContextUsed,
					lexiconById,
				);

				return {
					id: page.id,
					imageUrl,
					pageNo: page.pageNo,
					status: page.status,
					thumbUrl,
					transcription:
						page.transcriptionId === null
							? null
							: {
									contextWords: this.buildContextWords({
										lexiconById: pageLexiconById,
										text,
									}),
									id: page.transcriptionId,
									structured: page.transcriptionStructured,
									text,
								},
				};
			}),
		);

		return { items };
	}

	public async getUploadUrl(
		id: number,
		userId: number,
		payload?: DocumentUploadUrlRequestDto,
	): Promise<{ expiresAt: string; uploadUrl: string }> {
		return await DocumentModel.transaction(async (trx) => {
			const document =
				await this.documentRepository.findByIdAndOwnerIdForUpdate(
					id,
					userId,
					trx,
				);

			if (!document) {
				throw new HTTPError({
					message: DocumentErrorMessage.NOT_FOUND,
					status: HTTPCode.NOT_FOUND,
				});
			}

			const documentObject = document.toObject();

			if (documentObject.status !== DocumentStatus.DRAFT) {
				throw new HTTPError({
					message: DocumentErrorMessage.NOT_DRAFT,
					status: HTTPCode.CONFLICT,
				});
			}

			const currentPresetId = document.getPresetId();

			if (payload?.presetId && payload.presetId !== currentPresetId) {
				const preset = await this.documentRepository.findAccessiblePreset(
					payload.presetId,
					userId,
					trx,
				);

				if (!preset) {
					throw new HTTPError({
						message: DocumentValidationMessage.PRESET_NOT_FOUND,
						status: HTTPCode.NOT_FOUND,
					});
				}
			}

			const sourceKey = this.buildSourceKey(id);

			await this.documentRepository.updateDraftMetadata(
				id,
				{
					...(payload?.presetId !== undefined && {
						presetId: payload.presetId,
					}),
					...(payload?.fileBytes !== undefined && {
						sourceBytes: payload.fileBytes,
					}),
					sourceKey,
					...(payload?.fileName !== undefined && {
						sourceName: payload.fileName,
					}),
					...(payload?.title !== undefined && { title: payload.title }),
				},
				trx,
			);

			const { expiresAt, url: uploadUrl } =
				await this.storage.getUploadSignedUrl({
					contentType: ContentType.PDF,
					key: sourceKey,
				});

			return { expiresAt, uploadUrl };
		});
	}

	public async ingest(documentId: number, userId: number): Promise<void> {
		const document = await this.documentRepository.findWithPreset(
			documentId,
			userId,
		);

		if (!document) {
			throw new HTTPError({
				message: DocumentErrorMessage.NOT_FOUND,
				status: HTTPCode.NOT_FOUND,
			});
		}

		const documentObject = document.toObjectWithPreset();

		if (documentObject.status === DocumentStatus.INGESTING) {
			throw new HTTPError({
				message: DocumentErrorMessage.CURRENTLY_INGESTING,
				status: HTTPCode.CONFLICT,
			});
		}

		await this.documentRepository.updateStatus(
			documentId,
			DocumentStatus.INGESTING,
		);

		const { clear, filePath } = await this.downloadDocument(
			documentId,
			documentObject.sourceKey,
		);

		try {
			const pageCount = await this.pdfPageProcessor.getPageCount(filePath);

			if (pageCount > MAX_DOCUMENT_PAGES) {
				await this.documentRepository.setError(
					documentId,
					DocumentErrorMessage.EXCEEDED_MAX_PAGES,
				);
				throw new HTTPError({
					message: DocumentErrorMessage.EXCEEDED_MAX_PAGES,
					status: HTTPCode.CONTENT_TOO_LARGE,
				});
			}

			const {
				settings: { blankStdevThreshold },
			} = documentObject.preset;
			const existingPagesArray =
				await this.pageRepository.findPageNumbersByDocumentId(documentId);
			const existingPagesSet = new Set<number>(existingPagesArray);

			for (let page = 1; page <= pageCount; page++) {
				if (existingPagesSet.has(page)) {
					continue;
				}

				await this.processPage({
					blankStdevThreshold: blankStdevThreshold ?? null,
					documentId,
					filePath,
					page,
				});
			}

			await this.documentRepository.updatePageCount(documentId, pageCount);
			await this.documentRepository.updateStatus(
				documentId,
				DocumentStatus.READY,
			);
			await this.pageRepository.updateFirstPendingPagesAsQueued(
				documentId,
				PAGES_TO_QUEUE,
			);
		} catch (error) {
			if (error instanceof HTTPError) {
				throw error;
			}

			const caughtErrorMessage =
				error instanceof Error ? error.message : String(error);
			const finalErrorMessage = `${DocumentErrorMessage.INGEST_FAILED}: ${caughtErrorMessage}`;

			await this.documentRepository.setError(documentId, finalErrorMessage);
			throw new HTTPError({
				message: finalErrorMessage,
				status: HTTPCode.INTERNAL_SERVER_ERROR,
			});
		} finally {
			await clear();
		}
	}

	public async pause(documentId: number, userId: number): Promise<void> {
		const document = await this.documentRepository.findByIdAndOwnerId(
			documentId,
			userId,
		);

		if (!document) {
			throw new HTTPError({
				message: DocumentValidationMessage.NOT_FOUND,
				status: HTTPCode.NOT_FOUND,
			});
		}

		const { status } = document.toObject();

		if (status === DocumentStatus.PAUSED) {
			return;
		}

		if (status !== DocumentStatus.PROCESSING) {
			throw new HTTPError({
				message: DocumentValidationMessage.INVALID_STATUS_TO_PAUSE,
				status: HTTPCode.CONFLICT,
			});
		}

		const affectedRows = await this.documentRepository.updateOwnedStatusFrom({
			currentStatus: DocumentStatus.PROCESSING,
			id: documentId,
			ownerId: userId,
			status: DocumentStatus.PAUSED,
		});

		if (affectedRows === EMPTY_COLLECTION_LENGTH) {
			throw new HTTPError({
				message: DocumentValidationMessage.INVALID_STATUS_TO_PAUSE,
				status: HTTPCode.CONFLICT,
			});
		}
	}

	public async resume(documentId: number, userId: number): Promise<void> {
		const document = await this.documentRepository.findByIdAndOwnerId(
			documentId,
			userId,
		);

		if (!document) {
			throw new HTTPError({
				message: DocumentValidationMessage.NOT_FOUND,
				status: HTTPCode.NOT_FOUND,
			});
		}

		const { status } = document.toObject();

		if (status !== DocumentStatus.PAUSED) {
			throw new HTTPError({
				message: DocumentValidationMessage.INVALID_STATUS_TO_RESUME,
				status: HTTPCode.CONFLICT,
			});
		}

		const pages = await this.pageRepository.findResumablePages(documentId);

		const pendingPages = pages.filter(
			(page) => page.toObject().status === PageStatus.PENDING,
		);

		const affectedRows = await this.documentRepository.updateOwnedStatusFrom({
			currentStatus: DocumentStatus.PAUSED,
			id: documentId,
			ownerId: userId,
			status: DocumentStatus.PROCESSING,
		});

		if (affectedRows === EMPTY_COLLECTION_LENGTH) {
			throw new HTTPError({
				message: DocumentValidationMessage.INVALID_STATUS_TO_RESUME,
				status: HTTPCode.CONFLICT,
			});
		}

		if (pages.length === EMPTY_COLLECTION_LENGTH) {
			return;
		}

		try {
			if (pendingPages.length > EMPTY_COLLECTION_LENGTH) {
				const pendingPageIds = pendingPages.map((page) => page.toObject().id);

				await this.pageRepository.markPendingAsQueued(
					documentId,
					pendingPageIds,
				);
			}

			for (const page of pages) {
				const { id, pageNo } = page.toObject();

				await this.pageTranscribeQueue.add({
					documentId,
					pageId: id,
					pageNo,
				});
			}
		} catch {
			await this.documentRepository.updateOwnedStatusFrom({
				currentStatus: DocumentStatus.PROCESSING,
				id: documentId,
				ownerId: userId,
				status: DocumentStatus.PAUSED,
			});

			throw new HTTPError({
				message: DocumentValidationMessage.RESUME_FAILED,
				status: HTTPCode.INTERNAL_SERVER_ERROR,
			});
		}
	}
}

export { DocumentService };
