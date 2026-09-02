import { type Transaction } from "objection";

import { DatabaseTableName } from "~/libs/modules/database/database.js";
import { DocumentEntity } from "~/modules/documents/document.entity.js";
import { type DocumentModel } from "~/modules/documents/document.model.js";

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

	public async deleteById(id: number, trx: Transaction): Promise<void> {
		await this.documentModel.query(trx).deleteById(id).execute();
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

	public async findByIdAndOwnerIdForUpdate(
		id: number,
		ownerId: number,
		trx: Transaction,
	): Promise<DocumentEntity | null> {
		const document = await this.documentModel
			.query(trx)
			.findById(id)
			.where({ ownerId })
			.forUpdate();

		return document ? DocumentEntity.initialize(document) : null;
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
}

export { DocumentRepository };
