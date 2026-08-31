import {
	type DocumentCreateRequestDto,
	type DocumentCreateResponseDto,
	HTTPCode,
	HTTPError,
} from "@transcripta/shared";
import { ForeignKeyViolationError } from "objection";

import { type BaseStorage } from "~/libs/modules/storage/base-storage.module.js";

import { DocumentEntity } from "./document.entity.js";
import { DocumentModel } from "./document.model.js";
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
		const preset = (await DocumentModel.knex()
			.from("preset")
			.where({ id: presetId })
			.first()) as undefined | { id: number };

		if (!preset) {
			throw new HTTPError({
				message: DocumentValidationMessage.PRESET_NOT_FOUND,
				status: HTTPCode.NOT_FOUND,
			});
		}

		try {
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

			const { expiresAt, url: uploadUrl } =
				await this.storage.getUploadSignedUrl({
					contentType: "application/pdf",
					expiresInSeconds: DocumentValidationRule.TOKEN_TIME_LIMIT,
					key: sourceKey,
				});

			return {
				expiresAt,
				id: document.id,
				status: document.status,
				uploadUrl,
			};
		} catch (error) {
			if (
				error instanceof ForeignKeyViolationError &&
				(error.table === "users" ||
					Boolean(error.constraint.includes("owner_id")))
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
}

export { DocumentService };
