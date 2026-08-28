import { DocumentEntity } from "~/modules/documents/document.entity.js";
import { type DocumentModel } from "~/modules/documents/document.model.js";

class DocumentRepository {
	private documentModel: typeof DocumentModel;

	public constructor(documentModel: typeof DocumentModel) {
		this.documentModel = documentModel;
	}

	public async findAllByOwnerId(ownerId: number): Promise<DocumentEntity[]> {
		const documents = await this.documentModel
			.query()
			.where({ ownerId })
			.orderBy("createdAt", "desc")
			.execute();

		return documents.map((document) => DocumentEntity.initialize(document));
	}
}

export { DocumentRepository };
