import {
	type DocumentCreateRequestDto,
	type DocumentCreateResponseDto,
	HTTPCode,
	HTTPError,
} from "@transcripta/shared";

import { type BaseStorage } from "~/libs/modules/storage/base-storage.module.js";

import { DocumentEntity } from "./document.entity.js";
import { type DocumentRepository } from "./document.repository.js";
import {
	DocumentValidationMessage,
	DocumentValidationRule,
} from "./libs/enums/enums.js";
import { type DocumentGetAllResponseDto } from "./libs/types/types.js";

class DocumentService {
	private documentRepository: DocumentRepository;
	private storage: BaseStorage;

	public constructor(
		documentRepository: DocumentRepository,
		storage: BaseStorage,
	) {
		this.documentRepository = documentRepository;
		this.storage = storage;
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
		if (!fileName.toLowerCase().endsWith(".pdf")) {
			throw new HTTPError({
				message: DocumentValidationMessage.FILE_NAME_INVALID_EXTENSION,
				status: HTTPCode.UNPROCESSED_ENTITY,
			});
		}

		if (fileBytes > DocumentValidationRule.MAX_FILE_BYTES) {
			throw new HTTPError({
				message: DocumentValidationMessage.DOCUMENT_MAX_FILE_BYTES,
				status: HTTPCode.UNPROCESSED_ENTITY,
			});
		}

		const documentEntity = DocumentEntity.initializeNew({
			ownerId,
			presetId,
			sourceBytes: fileBytes,
			sourceName: fileName,
			title,
		});

		const createdDocument =
			await this.documentRepository.create(documentEntity);
		const document = createdDocument.toObject();

		const sourceKey = `uploads/${document.id.toString()}/original.pdf`;

		await this.documentRepository.updateSourceKey(document.id, sourceKey);

		const { expiresAt, url: uploadUrl } = await this.storage.getUploadSignedUrl(
			{
				contentType: "application/pdf",
				expiresInSeconds: DocumentValidationRule.TOKEN_TIME_LIMIT,
				key: sourceKey,
			},
		);

		return {
			expiresAt,
			id: document.id,
			status: document.status,
			uploadUrl,
		};
	}

	public async findAllByOwnerId(
		ownerId: number,
	): Promise<DocumentGetAllResponseDto> {
		const items = await this.documentRepository.findAllByOwnerId(ownerId);

		return {
			items: items.map((item) => item.toObject()),
		};
	}
}

export { DocumentService };
