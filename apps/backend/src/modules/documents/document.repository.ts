import { type DocumentGetLexiconItemResponseDto } from "@transcripta/shared";
import { raw, type Transaction } from "objection";

import { LEXICON_CONTEXT_ORDER } from "~/context/context.js";
import { DatabaseTableName } from "~/libs/modules/database/database.js";
import { type ValueOf } from "~/libs/types/types.js";
import { DocumentDetailsEntity } from "~/modules/documents/document-details.entity.js";
import { DocumentEntity } from "~/modules/documents/document.entity.js";
import { type DocumentModel } from "~/modules/documents/document.model.js";
import { LexiconEntryModel } from "~/modules/documents/lexicon-entry.model.js";
import { CLOSED_PAGE_STATUSES } from "~/modules/pages/libs/constants/constants.js";
import { PageModel } from "~/modules/pages/page.model.js";

import { EMPTY_COLLECTION_LENGTH } from "./libs/constants/constants.js";
import { DocumentRelationName, DocumentStatus } from "./libs/enums/enums.js";
import {
	type DocumentDetailsRow,
	type DocumentUpdateBudgetPayload,
	type DocumentUpdateDraftMetadataPayload,
	type DocumentUpdateOwnedStatus,
	type DocumentWithPagesFailed,
	type LexiconRow,
} from "./libs/types/types.js";

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

	public async deleteById(id: number, trx?: Transaction): Promise<void> {
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
		const knex = this.documentModel.knex();

		const documents = await knex
			.select<DocumentWithPagesFailed[]>(["d.*", "dp.pagesFailed"])
			.from(`${DatabaseTableName.DOCUMENT} as d`)
			.innerJoin(
				`${DatabaseTableName.DOCUMENT_PROGRESS} as dp`,
				"dp.documentId",
				"d.id",
			)
			.where("d.ownerId", ownerId)
			.orderBy("d.createdAt", "desc");

		return documents.map((document) => DocumentEntity.initialize(document));
	}

	public async findById(id: number): Promise<DocumentEntity | null> {
		const document = await this.documentModel.query().findById(id).execute();

		return document ? DocumentEntity.initialize(document) : null;
	}

	public async findByIdAndOwnerId(
		id: number,
		ownerId: number,
	): Promise<DocumentDetailsEntity | null> {
		const knex = this.documentModel.knex();

		const document = await knex
			.select<DocumentDetailsRow>([
				"dp.documentId as id",
				"d.error_message as errorMessage",
				"dp.title",
				"dp.status",
				"dp.pageCount",
				"dp.cursorPageNo",
				knex.raw("round(dp.budget_usd, 2)::text as ??", ["budgetUsd"]),
				knex.raw("round(dp.spent_usd, 2)::text as ??", ["spentUsd"]),
				knex.raw(
					"coalesce(round(dp.spent_usd / nullif(dp.budget_usd, 0) * 100, 1), 0)::float8 as ??",
					["usedPct"],
				),
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

	public async findByIdAndOwnerIdForUpdateWithDetails(
		id: number,
		ownerId: number,
		trx: Transaction,
	): Promise<DocumentDetailsEntity | null> {
		const knex = this.documentModel.knex();

		const document = await knex
			.select<DocumentDetailsRow>([
				"dp.documentId as id",
				"d.error_message as errorMessage",
				"dp.title",
				"dp.status",
				"dp.pageCount",
				"dp.cursorPageNo",
				knex.raw("round(dp.budget_usd, 2)::text as ??", ["budgetUsd"]),
				knex.raw("round(dp.spent_usd, 2)::text as ??", ["spentUsd"]),
				knex.raw(
					"coalesce(round(dp.spent_usd / nullif(dp.budget_usd, 0) * 100, 1), 0)::float8 as ??",
					["usedPct"],
				),
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
			.transacting(trx)
			.forUpdate("d")
			.first();

		if (!document) {
			return null;
		}

		return DocumentDetailsEntity.initialize(document);
	}

	public async findDraftsOlderThan(date: string): Promise<DocumentEntity[]> {
		const documents = await this.documentModel
			.query()
			.where({ status: DocumentStatus.DRAFT })
			.where("createdAt", "<", date)
			.execute();

		return documents.map((document) => DocumentEntity.initialize(document));
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

	public async findLiveLexiconByDocumentId(
		documentId: number,
	): Promise<DocumentGetLexiconItemResponseDto[]> {
		return await LexiconEntryModel.query()
			.select(
				"id",
				"kind",
				"valueDisplay",
				"freq",
				"distinctPages",
				"firstPageNo",
				"lastPageNo",
			)
			.where("documentId", documentId)
			.whereNull("invalidatedAt")
			.orderBy([...LEXICON_CONTEXT_ORDER])
			.castTo<DocumentGetLexiconItemResponseDto[]>();
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

	public async markDoneIfAllPagesClosed(
		id: number,
		trx: Transaction,
	): Promise<void> {
		const openPages = PageModel.query(trx)
			.select("id")
			.where({ documentId: id })
			.whereNotIn("status", [...CLOSED_PAGE_STATUSES]);

		await this.documentModel
			.query(trx)
			.patch({ status: DocumentStatus.DONE })
			.where({ id })
			.whereNotExists(openPages)
			.execute();
	}

	public async markProcessingIfDone(
		id: number,
		trx: Transaction,
	): Promise<void> {
		await this.documentModel
			.query(trx)
			.patch({ status: DocumentStatus.PROCESSING })
			.where({
				id,
				status: DocumentStatus.DONE,
			})
			.execute();
	}

	public async resumeFromBudgetStop(
		id: number,
		trx: Transaction,
	): Promise<number> {
		return await this.documentModel
			.query(trx)
			.patch({ status: DocumentStatus.PROCESSING })
			.where({ id, status: DocumentStatus.BUDGET_STOP })
			.whereColumn("budgetUsd", ">", "spentUsd")
			.execute();
	}

	public async setError(id: number, errorMessage: string): Promise<void> {
		await this.documentModel
			.query()
			.patch({ errorMessage, status: DocumentStatus.FAILED })
			.where({ id })
			.execute();
	}

	public async setErrorMessage(
		id: number,
		errorMessage: string,
	): Promise<void> {
		await this.documentModel
			.query()
			.patch({ errorMessage })
			.where({ id })
			.execute();
	}

	public async updateBudget(
		{ id, limitUsd, ownerId }: DocumentUpdateBudgetPayload,
		trx: Transaction,
	): Promise<number> {
		return await this.documentModel
			.query(trx)
			.patch({ budgetUsd: limitUsd })
			.where({ id, ownerId })
			.execute();
	}

	public async updateCursorPageNo(
		documentId: number,
		cursorPageNo: number,
		trx?: Transaction,
	): Promise<void> {
		await this.documentModel
			.query(trx)
			.patch({
				cursorPageNo: raw("GREATEST(??, ?)", ["cursor_page_no", cursorPageNo]),
			})
			.where({ id: documentId })
			.execute();
	}

	public async updateDraftMetadata(
		id: number,
		{
			presetId,
			sourceBytes,
			sourceKey,
			sourceName,
			title,
		}: DocumentUpdateDraftMetadataPayload,
		trx?: Transaction,
	): Promise<void> {
		const patchData: Record<string, unknown> = {
			sourceKey,
		};

		if (presetId !== undefined) {
			patchData["presetId"] = presetId;
		}
		if (title !== undefined) {
			patchData["title"] = title;
		}
		if (sourceName !== undefined) {
			patchData["sourceName"] = sourceName;
		}
		if (sourceBytes !== undefined) {
			patchData["sourceBytes"] = sourceBytes;
		}

		await this.documentModel
			.query(trx)
			.patch(patchData)
			.where({ id })
			.execute();
	}

	public async updateOwnedStatusFrom({
		currentStatus,
		id,
		ownerId,
		status,
	}: DocumentUpdateOwnedStatus): Promise<number> {
		return await this.documentModel
			.query()
			.patch({ status })
			.where({
				id,
				ownerId,
				status: currentStatus,
			})
			.execute();
	}

	public async updatePageCount(
		id: number,
		pageCount: number,
		trx?: Transaction,
	): Promise<void> {
		await this.documentModel
			.query(trx)
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
		trx?: Transaction,
	): Promise<void> {
		await this.documentModel
			.query(trx)
			.patch({ status })
			.where({ id })
			.execute();
	}
}

export { DocumentRepository };
