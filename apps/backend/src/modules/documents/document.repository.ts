import { type Transaction } from "objection";

import { DatabaseTableName } from "~/libs/modules/database/database.js";
import { type ValueOf } from "~/libs/types/types.js";
import { DocumentDetailsEntity } from "~/modules/documents/document-details.entity.js";
import { DocumentEntity } from "~/modules/documents/document.entity.js";
import { type DocumentModel } from "~/modules/documents/document.model.js";
import { LexiconEntryModel } from "~/modules/documents/lexicon-entry.model.js";

import { EMPTY_COLLECTION_LENGTH } from "./libs/constants/constants.js";
import { DocumentRelationName, DocumentStatus } from "./libs/enums/enums.js";
import { type LexiconRow } from "./libs/types/lexicon-row.type.js";

type DocumentDetailsRow = {
	budgetUsd: string;
	closedPct: number;
	cursorPageNo: number;
	id: number;
	pageCount: number;
	pagesBlank: number;
	pagesFailed: number;
	pagesInWork: number;
	pagesPending: number;
	pagesReadyToCheck: number;
	pagesSkipped: number;
	pagesTotal: number;
	pagesVerified: number;
	presetId: number;
	presetName: string;
	presetVersion: number;
	spentUsd: string;
	status: ValueOf<typeof DocumentStatus>;
	title: string;
	verifiedPct: number;
};

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

	public async findByIdAndOwnerId(
		id: number,
		ownerId: number,
	): Promise<DocumentDetailsEntity | null> {
		const document = await this.documentModel
			.knex()
			.select<DocumentDetailsRow>([
				"dp.documentId as id",
				"dp.title",
				"dp.status",
				"dp.pageCount",
				"dp.cursorPageNo",
				"dp.budgetUsd",
				"dp.spentUsd",
				"pr.id as presetId",
				"pr.name as presetName",
				"pr.version as presetVersion",
				"dp.pagesTotal",
				"dp.pagesVerified",
				"dp.pagesReadyToCheck",
				"dp.pagesInWork",
				"dp.pagesPending",
				"dp.pagesFailed",
				"dp.pagesBlank",
				"dp.pagesSkipped",
				"dp.verifiedPct",
				"dp.closedPct",
			])
			.from(`${DatabaseTableName.DOCUMENT} as d`)
			.innerJoin(
				`${DatabaseTableName.DOCUMENT_PROGRESS} as dp`,
				"dp.documentId",
				"d.id",
			)
			.innerJoin(`${DatabaseTableName.PRESET} as pr`, "pr.id", "d.presetId")
			.where({
				"d.id": id,
				"d.ownerId": ownerId,
			})
			.first();

		if (!document) {
			return null;
		}

		return DocumentDetailsEntity.initialize(document);
	}

	public async findLexiconByIds(ids: number[]): Promise<LexiconRow[]> {
		if (ids.length === EMPTY_COLLECTION_LENGTH) {
			return [];
		}

		return await LexiconEntryModel.query()
			.select("id", "valueDisplay", "distinctPages")
			.whereIn("id", ids)
			.castTo<LexiconRow[]>();
	}

	public async findOwnedDocumentId(
		id: number,
		ownerId: number,
	): Promise<null | number> {
		const document = await this.documentModel
			.query()
			.select("id")
			.where({ id, ownerId })
			.first();

		return document?.id ?? null;
	}

	public async findWithPreset(
		id: number,
		userId: number,
	): Promise<DocumentEntity | null> {
		const document = await this.documentModel
			.query()
			.findOne({ id, ownerId: userId })
			.withGraphFetched(DocumentRelationName.PRESET);

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
