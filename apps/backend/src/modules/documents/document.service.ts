import {
	ContentType,
	type DocumentCreateRequestDto,
	type DocumentCreateResponseDto,
	HTTPCode,
	HTTPError,
} from "@transcripta/shared";
import { createHash } from "node:crypto";
import { ForeignKeyViolationError } from "objection";

import { PDFPageProcessor } from "~/libs/modules/pdf-page-processor/pdf-page-processor.js";
import { type BaseStorage } from "~/libs/modules/storage/base-storage.module.js";

import { PageEntity, PageRepository } from "../pages/pages.js";
import { DocumentEntity } from "./document.entity.js";
import { DocumentModel } from "./document.model.js";
import { type DocumentRepository } from "./document.repository.js";
import {
	DOCUMENT_OWNER_ID_FOREIGN,
	MAX_DOCUMENT_PAGES,
	PAGES_TO_QUEUE,
} from "./libs/constants/constants.js";
import {
	DocumentErrorMessage,
	DocumentStatus,
	DocumentValidationMessage,
	PageStatus,
} from "./libs/enums/enums.js";
import { type DocumentGetAllResponseDto } from "./libs/types/types.js";

class DocumentService {
	private documentRepository: DocumentRepository;
	private pageRepository: PageRepository;
	private pdfPageProcessor: PDFPageProcessor;
	private storage: BaseStorage;

	public constructor({
		documentRepository,
		pageRepository,
		pdfPageProcessor,
		storage,
	}: {
		documentRepository: DocumentRepository;
		pageRepository: PageRepository;
		pdfPageProcessor: PDFPageProcessor;
		storage: BaseStorage;
	}) {
		this.documentRepository = documentRepository;
		this.pageRepository = pageRepository;
		this.storage = storage;
		this.pdfPageProcessor = pdfPageProcessor;
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

				const sourceKey = `uploads/${document.id.toString()}/original.pdf`;

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

	public async findAllByOwnerId(
		ownerId: number,
	): Promise<DocumentGetAllResponseDto> {
		const items = await this.documentRepository.findAllByOwnerId(ownerId);

		return {
			items: items.map((item) => item.toObject()),
		};
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
				status: HTTPCode.INTERNAL_SERVER_ERROR,
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

			await this.documentRepository.setError(
				documentId,
				`${DocumentErrorMessage.INGEST_FAILED}: ${finalErrorMessage}`,
			);
			throw new HTTPError({
				message: `${DocumentErrorMessage.INGEST_FAILED}: ${finalErrorMessage}`,
				status: HTTPCode.INTERNAL_SERVER_ERROR,
			});
		} finally {
			await clear();
		}
	}
}

export { DocumentService };
