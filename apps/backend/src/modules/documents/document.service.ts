import {
	ContentType,
	type DocumentCreateRequestDto,
	type DocumentCreateResponseDto,
	type DocumentGetByIdBudgetResponseDto,
	type DocumentGetLexiconResponseDto,
	type DocumentGetPagesResponseDto,
	DocumentValidationMessage,
	EMPTY_LENGTH,
	HTTPCode,
	HTTPError,
} from "@transcripta/shared";
import { createHash } from "node:crypto";
import { ForeignKeyViolationError } from "objection";

import {
	ObjectNotUploadedError,
	PDFTimeoutError,
} from "~/libs/exceptions/exceptions.js";
import { PDFPageProcessor } from "~/libs/modules/pdf-page-processor/pdf-page-processor.js";
import { type PageTranscribeQueue } from "~/libs/modules/queue/page-transcribe-queue.module.js";
import { type BaseStorage } from "~/libs/modules/storage/base-storage.module.js";
import { StorageBucket } from "~/libs/modules/storage/storage.js";
import { type PageWithTranscriptionRow } from "~/modules/pages/libs/types/types.js";
import {
	buildContextWords,
	buildPageLexiconMap,
	extractLexiconIds,
} from "~/modules/transcription/libs/helpers/helpers.js";

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
	PAGES_TO_QUEUE,
} from "./libs/constants/constants.js";
import {
	DocumentErrorMessage,
	DocumentStatus,
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
	private pageRepository: PageRepository;
	private pageTranscribeQueue: PageTranscribeQueue;
	private pdfPageProcessor: PDFPageProcessor;
	private storage: BaseStorage;

	public constructor({
		documentRepository,
		pageRepository,
		pageTranscribeQueue,
		pdfPageProcessor,
		storage,
	}: DocumentServiceDependencies) {
		this.documentRepository = documentRepository;
		this.pageRepository = pageRepository;
		this.pdfPageProcessor = pdfPageProcessor;
		this.storage = storage;
		this.pageTranscribeQueue = pageTranscribeQueue;
	}

	private buildSourceKey(documentId: number): string {
		return `uploads/${documentId.toString()}/original.pdf`;
	}

	private collectLexiconIds(pages: PageWithTranscriptionRow[]): number[] {
		const lexiconIds = new Set<number>();

		for (const page of pages) {
			for (const id of extractLexiconIds(page.transcriptionContextUsed)) {
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
			const isObjectNotUploaded = error instanceof ObjectNotUploadedError;
			const finalErrorMessage = isObjectNotUploaded
				? DocumentErrorMessage.DOCUMENT_NOT_UPLOADED
				: DocumentErrorMessage.DOWNLOAD_FAILED;
			const statusCode = isObjectNotUploaded
				? HTTPCode.NOT_FOUND
				: HTTPCode.INTERNAL_SERVER_ERROR;

			await this.documentRepository.setError(documentId, finalErrorMessage);
			throw new HTTPError({
				message: finalErrorMessage,
				status: statusCode,
			});
		}

		return { clear, filePath };
	}

	private async enqueueBudgetResumedPages(
		documentId: number,
		ownerId: number,
	): Promise<void> {
		try {
			const pages = await this.pageRepository.findQueuedPages(documentId);

			await Promise.all(
				pages.map((page) => {
					const { id, pageNo } = page.toObject();

					return this.pageTranscribeQueue.add({
						documentId,
						pageId: id,
						pageNo,
					});
				}),
			);
		} catch (error) {
			await this.documentRepository.updateOwnedStatusFrom({
				currentStatus: DocumentStatus.PROCESSING,
				id: documentId,
				ownerId,
				status: DocumentStatus.BUDGET_STOP,
			});

			const caughtErrorMessage =
				error instanceof Error ? error.message : String(error);

			await this.documentRepository.setErrorMessage(
				documentId,
				`${DocumentErrorMessage.RESUME_FAILED}: ${caughtErrorMessage}`,
			);

			throw new HTTPError({
				message: DocumentErrorMessage.RESUME_FAILED,
				status: HTTPCode.INTERNAL_SERVER_ERROR,
			});
		}
	}

	private async enqueueTranscriptionPages(
		documentId: number,
		pages: PageEntity[],
	): Promise<void> {
		await Promise.all(
			pages.map((page) => {
				const { id, pageNo } = page.toObject();

				return this.pageTranscribeQueue.add({
					documentId,
					pageId: id,
					pageNo,
				});
			}),
		);
	}

	private async finalizeIngest(
		documentId: number,
		userId: number,
		pageCount: number,
	): Promise<PageEntity[]> {
		return await DocumentModel.transaction(async (trx) => {
			const currentDocument =
				await this.documentRepository.findByIdAndOwnerIdForUpdate(
					documentId,
					userId,
					trx,
				);

			if (!currentDocument) {
				this.throwDocumentNotFoundError();
			}

			await this.documentRepository.updatePageCount(documentId, pageCount, trx);
			await this.documentRepository.updateStatus(
				documentId,
				DocumentStatus.READY,
				trx,
			);
			await this.pageRepository.updateFirstPendingPagesAsQueued(
				documentId,
				PAGES_TO_QUEUE,
				trx,
			);

			return await this.pageRepository.findQueuedPages(documentId, trx);
		});
	}

	private async getIngestPageCount(
		documentId: number,
		filePath: string,
	): Promise<number> {
		let pageCount: number;
		try {
			pageCount = await this.pdfPageProcessor.getPageCount(filePath);
		} catch (error) {
			const errorMessage =
				error instanceof Error ? error.message : String(error);

			await this.documentRepository.setError(documentId, errorMessage);
			throw new HTTPError({
				message: errorMessage,
				status: HTTPCode.UNPROCESSED_ENTITY,
			});
		}

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

		return pageCount;
	}

	private async getPresignedUrl(key: null | string): Promise<null | string> {
		if (key === null) {
			return null;
		}

		return await this.storage.getReadSignedUrl(key);
	}

	private async handleIngestError(
		documentId: number,
		error: unknown,
	): Promise<never> {
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
	}

	private async prepareDocumentForIngest(
		documentId: number,
		userId: number,
	): Promise<DocumentEntity> {
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

		const { status } = document.toObjectWithPreset();

		if (status === DocumentStatus.INGESTING) {
			throw new HTTPError({
				message: DocumentErrorMessage.CURRENTLY_INGESTING,
				status: HTTPCode.CONFLICT,
			});
		}

		await this.documentRepository.updateStatus(
			documentId,
			DocumentStatus.INGESTING,
		);

		return document;
	}

	private async preparePages(
		document: DocumentEntity,
		filePath: string,
	): Promise<number> {
		const { id: documentId, preset } = document.toObjectWithPreset();
		const pageCount = await this.getIngestPageCount(documentId, filePath);
		const {
			settings: { blankStdevThreshold },
		} = preset;
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

		return pageCount;
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
		let pngPath: string;
		try {
			pngPath = await this.pdfPageProcessor.convertPageToPNG(filePath, page);
		} catch (error) {
			const errorMessage =
				error instanceof Error ? error.message : String(error);
			const statusCode =
				error instanceof PDFTimeoutError
					? HTTPCode.GATEWAY_TIMEOUT
					: HTTPCode.UNPROCESSED_ENTITY;

			await this.documentRepository.setError(documentId, errorMessage);
			throw new HTTPError({
				message: errorMessage,
				status: statusCode,
			});
		}

		const { isBlank, pageImage, pageThumbnail } =
			await this.pdfPageProcessor.processPage(pngPath, blankStdevThreshold);

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
		} catch {
			const errorMessage = DocumentErrorMessage.PAGE_UPLOAD_FAILED;

			await this.documentRepository.setError(documentId, errorMessage);
			throw new HTTPError({
				message: errorMessage,
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

	private throwDocumentNotFoundError(): never {
		throw new HTTPError({
			message: DocumentValidationMessage.DOCUMENT_NOT_FOUND,
			status: HTTPCode.NOT_FOUND,
		});
	}

	private throwInvalidStatusToPauseError(): never {
		throw new HTTPError({
			message: DocumentValidationMessage.INVALID_STATUS_TO_PAUSE,
			status: HTTPCode.CONFLICT,
		});
	}

	private throwInvalidStatusToResumeError(): never {
		throw new HTTPError({
			message: DocumentValidationMessage.INVALID_STATUS_TO_RESUME,
			status: HTTPCode.CONFLICT,
		});
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

			await this.storage.deleteByPrefix({
				bucket: StorageBucket.UPLOADS,
				prefix: `uploads/${id.toString()}/`,
			});
			await this.storage.deleteByPrefix({
				bucket: StorageBucket.PAGES,
				prefix: `pages/${id.toString()}/`,
			});

			await this.documentRepository.deleteById(id, trx);
		});
	}

	public async findAllByOwnerId(
		ownerId: number,
	): Promise<DocumentGetAllResponseDto> {
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

	public async findLexicon(
		documentId: number,
		ownerId: number,
	): Promise<DocumentGetLexiconResponseDto> {
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

		const items =
			await this.documentRepository.findLiveLexiconByDocumentId(
				ownedDocumentId,
			);

		return { items };
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
				const pageLexiconById = buildPageLexiconMap(
					page.transcriptionContextUsed,
					lexiconById,
				);

				return {
					attempts: page.attempts,
					id: page.id,
					imageUrl,
					lastError: page.lastError,
					pageNo: page.pageNo,
					status: page.status,
					thumbUrl,
					transcription:
						page.transcriptionId === null
							? null
							: {
									contextWords: buildContextWords({
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
		const document = await this.prepareDocumentForIngest(documentId, userId);
		const { clear, filePath } = await this.downloadDocument(
			documentId,
			document.toObjectWithPreset().sourceKey,
		);

		try {
			const pageCount = await this.preparePages(document, filePath);
			const pages = await this.finalizeIngest(documentId, userId, pageCount);

			await this.enqueueTranscriptionPages(documentId, pages);
		} catch (error) {
			await this.handleIngestError(documentId, error);
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
			this.throwDocumentNotFoundError();
		}

		const { status } = document.toObject();

		if (status === DocumentStatus.PAUSED) {
			return;
		}

		if (status !== DocumentStatus.PROCESSING) {
			this.throwInvalidStatusToPauseError();
		}

		const affectedRows = await this.documentRepository.updateOwnedStatusFrom({
			currentStatus: DocumentStatus.PROCESSING,
			id: documentId,
			ownerId: userId,
			status: DocumentStatus.PAUSED,
		});

		if (affectedRows === EMPTY_COLLECTION_LENGTH) {
			const currentDocument = await this.documentRepository.findByIdAndOwnerId(
				documentId,
				userId,
			);

			if (!currentDocument) {
				this.throwDocumentNotFoundError();
			}

			if (currentDocument.toObject().status === DocumentStatus.PAUSED) {
				return;
			}

			this.throwInvalidStatusToPauseError();
		}
	}
	public async resume(documentId: number, userId: number): Promise<void> {
		const pages = await DocumentModel.transaction(async (trx) => {
			const document =
				await this.documentRepository.findByIdAndOwnerIdForUpdate(
					documentId,
					userId,
					trx,
				);

			if (!document) {
				this.throwDocumentNotFoundError();
			}

			if (document.toObject().status !== DocumentStatus.PAUSED) {
				this.throwInvalidStatusToResumeError();
			}

			await this.documentRepository.updateStatus(
				documentId,
				DocumentStatus.PROCESSING,
				trx,
			);
			await this.pageRepository.updateFirstPendingPagesAsQueued(
				documentId,
				PAGES_TO_QUEUE,
				trx,
			);

			return await this.pageRepository.findQueuedPages(documentId, trx);
		});

		if (pages.length === EMPTY_COLLECTION_LENGTH) {
			return;
		}

		try {
			await Promise.all(
				pages.map((page) => {
					const { id, pageNo } = page.toObject();

					return this.pageTranscribeQueue.add({
						documentId,
						pageId: id,
						pageNo,
					});
				}),
			);
		} catch (error) {
			await this.documentRepository.updateOwnedStatusFrom({
				currentStatus: DocumentStatus.PROCESSING,
				id: documentId,
				ownerId: userId,
				status: DocumentStatus.PAUSED,
			});

			const caughtErrorMessage =
				error instanceof Error ? error.message : String(error);

			await this.documentRepository.setErrorMessage(
				documentId,
				`${DocumentErrorMessage.RESUME_FAILED}: ${caughtErrorMessage}`,
			);

			throw new HTTPError({
				message: DocumentErrorMessage.RESUME_FAILED,
				status: HTTPCode.INTERNAL_SERVER_ERROR,
			});
		}
	}

	public async updateBudget(
		id: number,
		limitUsd: string,
		ownerId: number,
	): Promise<DocumentGetByIdBudgetResponseDto> {
		const resumedRows = await DocumentModel.transaction(async (trx) => {
			const updatedRows = await this.documentRepository.updateBudget(
				{ id, limitUsd, ownerId },
				trx,
			);

			if (updatedRows === EMPTY_LENGTH) {
				this.throwDocumentNotFoundError();
			}

			return await this.documentRepository.resumeFromBudgetStop(id, trx);
		});

		if (resumedRows !== EMPTY_LENGTH) {
			await this.enqueueBudgetResumedPages(id, ownerId);
		}

		const { budget } = await this.findById(id, ownerId);

		return budget;
	}
}

export { DocumentService };
