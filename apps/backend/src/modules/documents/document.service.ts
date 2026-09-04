import {
	ContentType,
	type DocumentCreateRequestDto,
	type DocumentCreateResponseDto,
	type DocumentGetPagesContextWordResponseDto,
	type DocumentGetPagesResponseDto,
	HTTPCode,
	HTTPError,
} from "@transcripta/shared";
import { ForeignKeyViolationError } from "objection";

import { type BaseStorage } from "~/libs/modules/storage/base-storage.module.js";
import { type PageWithTranscriptionRow } from "~/modules/pages/libs/types/types.js";
import { type PageRepository } from "~/modules/pages/page.repository.js";

import { DocumentEntity } from "./document.entity.js";
import { DocumentModel } from "./document.model.js";
import { type DocumentRepository } from "./document.repository.js";
import {
	DOCUMENT_OWNER_ID_FOREIGN,
	EMPTY_COLLECTION_LENGTH,
	NOT_FOUND_INDEX,
} from "./libs/constants/constants.js";
import { DocumentValidationMessage } from "./libs/enums/enums.js";
import {
	type DocumentGetAllResponseDto,
	type DocumentGetByIdResponseDto,
} from "./libs/types/types.js";

class DocumentService {
	private documentRepository: DocumentRepository;
	private pageRepository: PageRepository;
	private storage: BaseStorage;

	public constructor(
		documentRepository: DocumentRepository,
		pageRepository: PageRepository,
		storage: BaseStorage,
	) {
		this.documentRepository = documentRepository;
		this.pageRepository = pageRepository;
		this.storage = storage;
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

	private collectLexiconIds(pages: PageWithTranscriptionRow[]): number[] {
		const lexiconIds = new Set<number>();

		for (const page of pages) {
			for (const id of this.extractLexiconIds(page.transcriptionContextUsed)) {
				lexiconIds.add(id);
			}
		}

		return [...lexiconIds];
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
}

export { DocumentService };
