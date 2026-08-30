import { DocumentEntity } from "~/modules/documents/document.entity.js";
import { type DocumentModel } from "~/modules/documents/document.model.js";

class DocumentRepository {
	private documentModel: typeof DocumentModel;

	public constructor(documentModel: typeof DocumentModel) {
		this.documentModel = documentModel;
	}

	public async create(entity: DocumentEntity): Promise<DocumentEntity> {
		const document = await this.documentModel
			.query()
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

	public async updateSourceKey(id: number, sourceKey: string): Promise<void> {
		await this.documentModel
			.query()
			.patch({ sourceKey })
			.where({ id })
			.execute();
	}
}

export { DocumentRepository };
