import { type Transaction } from "objection";

import { DatabaseTableName } from "~/libs/modules/database/database.js";
import { ValueOf } from "~/libs/types/types.js";
import { DocumentEntity } from "~/modules/documents/document.entity.js";
import { type DocumentModel } from "~/modules/documents/document.model.js";

import { DocumentStatus } from "./libs/types/types.js";

class DocumentRepository {
	private documentModel: typeof DocumentModel;

	public constructor(documentModel: typeof DocumentModel) {
		this.documentModel = documentModel;
	}

	public async create(
		entity: DocumentEntity,
		trx?: Transaction,
	): Promise<DocumentEntity> {
		const document = await this.documentModel
			.query(trx)
			.insert(entity.toNewObject())
			.returning("*")
			.execute();
		return DocumentEntity.initialize(document);
	}

	public async findAccessiblePreset(
		presetId: number,
		ownerId: number,
		trx?: Transaction,
	): Promise<undefined | { id: number }> {
		const preset = (await this.documentModel
			.query(trx)
			.knex()
			.from(DatabaseTableName.PRESET)
			.where({ id: presetId })
			.andWhere((builder) => {
				builder.where({ is_public: true }).orWhere({ owner_id: ownerId });
			})
			.first()) as undefined | { id: number };

		return preset;
	}

	public async findAllByOwnerId(ownerId: number): Promise<DocumentEntity[]> {
		const documents = await this.documentModel
			.query()
			.where({ ownerId })
			.orderBy("createdAt", "desc")
			.execute();

		return documents.map((document) => DocumentEntity.initialize(document));
	}

	public async findByIdWithPreset(id: number): Promise<DocumentEntity | null> {
		const document = await this.documentModel
			.query()
			.findById(id)
			.withGraphFetched(DatabaseTableName.PRESET)
			.execute();

		return document ? DocumentEntity.initialize(document) : null;
	}

	public async setError(id: number, errorMessage: string): Promise<void> {
		await this.documentModel
			.query()
			.patch({ errorMessage, status: DocumentStatus.FAILED })
			.where({ id })
			.execute();
	}

	public async updatePageCount(id: number, pageCount: number): Promise<void> {
		await this.documentModel
			.query()
			.patch({ pageCount })
			.where({ id })
			.execute();
	}

	public async updateSourceKey(
		id: number,
		sourceKey: string,
		trx?: Transaction,
	): Promise<void> {
		await this.documentModel
			.query(trx)
			.patch({ sourceKey })
			.where({ id })
			.execute();
	}

	public async updateStatus(
		id: number,
		status: ValueOf<typeof DocumentStatus>,
	): Promise<void> {
		await this.documentModel.query().patch({ status }).where({ id }).execute();
	}
}

export { DocumentRepository };
