import { type Transaction } from "objection";

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

	public async findAllByOwnerId(ownerId: number): Promise<DocumentEntity[]> {
		const documents = await this.documentModel
			.query()
			.where({ ownerId })
			.orderBy("createdAt", "desc")
			.execute();

		return documents.map((document) => DocumentEntity.initialize(document));
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
