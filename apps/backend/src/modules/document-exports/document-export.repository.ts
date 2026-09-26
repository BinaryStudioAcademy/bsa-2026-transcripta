import { DocumentExportEntity } from "./document-export.entity.js";
import { type DocumentExportModel } from "./document-export.model.js";
import { DocumentExportStatus } from "./libs/enums/enums.js";

class DocumentExportRepository {
	private documentExportModel: typeof DocumentExportModel;

	public constructor(documentExportModel: typeof DocumentExportModel) {
		this.documentExportModel = documentExportModel;
	}

	public async create(
		entity: DocumentExportEntity,
	): Promise<DocumentExportEntity> {
		const documentExport = await this.documentExportModel
			.query()
			.insert(entity.toNewObject())
			.returning("*")
			.execute();

		return DocumentExportEntity.initialize(documentExport);
	}

	public async findByIdAndOwner(
		id: number,
		ownerId: number,
	): Promise<DocumentExportEntity | null> {
		const documentExport = await this.documentExportModel
			.query()
			.findById(id)
			.where("requestedBy", ownerId)
			.execute();

		if (!documentExport) {
			return null;
		}

		return DocumentExportEntity.initialize(documentExport);
	}

	public async setFailed({
		errorMessage,
		finishedAt,
		id,
	}: {
		errorMessage: string;
		finishedAt: string;
		id: number;
	}): Promise<void> {
		await this.documentExportModel
			.query()
			.patchAndFetchById(id, {
				errorMessage,
				finishedAt,
				status: DocumentExportStatus.FAILED,
			})
			.execute();
	}

	public async setReady({
		finishedAt,
		id,
		objectKey,
		sizeBytes,
	}: {
		finishedAt: string;
		id: number;
		objectKey: string;
		sizeBytes: number;
	}): Promise<void> {
		await this.documentExportModel
			.query()
			.patchAndFetchById(id, {
				finishedAt: finishedAt,
				objectKey: objectKey,
				sizeBytes: sizeBytes,
				status: DocumentExportStatus.READY,
			})
			.execute();
	}
}

export { DocumentExportRepository };
