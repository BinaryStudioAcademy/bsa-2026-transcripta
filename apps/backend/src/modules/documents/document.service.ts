import {
	ContentType,
	type DocumentCreateRequestDto,
	type DocumentCreateResponseDto,
	DocumentStatus,
	HTTPCode,
	HTTPError,
	type ValueOf,
} from "@transcripta/shared";
import { ForeignKeyViolationError } from "objection";

import { type BaseStorage } from "~/libs/modules/storage/base-storage.module.js";
import { StorageBucket } from "~/libs/modules/storage/storage.js";

import { DocumentEntity } from "./document.entity.js";
import { DocumentModel } from "./document.model.js";
import { type DocumentRepository } from "./document.repository.js";
import { DOCUMENT_OWNER_ID_FOREIGN } from "./libs/constants/constant.js";
import { DocumentValidationMessage } from "./libs/enums/enums.js";
import { type DocumentGetAllResponseDto } from "./libs/types/types.js";

type DocumentStatusValue = ValueOf<typeof DocumentStatus>;

const NON_DELETABLE_DOCUMENT_STATUSES: ReadonlySet<DocumentStatusValue> =
	new Set([DocumentStatus.INGESTING, DocumentStatus.PROCESSING]);

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
}

export { DocumentService };
