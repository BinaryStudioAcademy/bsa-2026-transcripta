import { DocumentStatus, type ValueOf } from "@transcripta/shared";

import { DocumentErrorMessage } from "./libs/enums/enums.js";
import { type DocumentGetAllItemResponseDto } from "./libs/types/types.js";

type DocumentStatusValue = ValueOf<typeof DocumentStatus>;

type Preset = {
	settings: {
		blankStdevThreshold?: number;
	};
};

class DocumentEntity {
	private budgetUsd: string;

	private createdAt: string;

	private cursorPageNo: number;

	private id: null | number;

	private ownerId: number;

	private pageCount: number;

	private preset: null | Preset;

	private presetId: number;

	private sourceBytes: null | number;

	private sourceKey: null | string;

	private sourceName: null | string;

	private spentUsd: string;

	private status: DocumentStatusValue;

	private title: string;

	private constructor({
		budgetUsd,
		createdAt,
		cursorPageNo,
		id,
		ownerId,
		pageCount,
		preset,
		presetId,
		sourceBytes,
		sourceKey,
		sourceName,
		spentUsd,
		status,
		title,
	}: {
		budgetUsd: string;
		createdAt: string;
		cursorPageNo: number;
		id: null | number;
		ownerId: number;
		pageCount: number;
		preset?: null | Preset;
		presetId: number;
		sourceBytes: null | number;
		sourceKey: null | string;
		sourceName: null | string;
		spentUsd: string;
		status: DocumentStatusValue;
		title: string;
	}) {
		this.budgetUsd = budgetUsd;
		this.createdAt = createdAt;
		this.cursorPageNo = cursorPageNo;
		this.id = id;
		this.ownerId = ownerId;
		this.pageCount = pageCount;
		this.preset = preset ?? null;
		this.presetId = presetId;
		this.sourceBytes = sourceBytes;
		this.sourceKey = sourceKey;
		this.sourceName = sourceName;
		this.spentUsd = spentUsd;
		this.status = status;
		this.title = title;
	}

	public static initialize({
		budgetUsd,
		createdAt,
		cursorPageNo,
		id,
		ownerId,
		pageCount,
		preset,
		presetId,
		sourceBytes,
		sourceKey,
		sourceName,
		spentUsd,
		status,
		title,
	}: {
		budgetUsd: string;
		createdAt: string;
		cursorPageNo: number;
		id: number;
		ownerId: number;
		pageCount: number;
		preset?: Preset;
		presetId: number;
		sourceBytes?: null | number;
		sourceKey?: null | string;
		sourceName?: null | string;
		spentUsd: string;
		status: DocumentStatusValue;
		title: string;
	}): DocumentEntity {
		return new DocumentEntity({
			budgetUsd,
			createdAt,
			cursorPageNo,
			id,
			ownerId,
			pageCount,
			preset: preset ?? null,
			presetId,
			sourceBytes: sourceBytes ?? null,
			sourceKey: sourceKey ?? null,
			sourceName: sourceName ?? null,
			spentUsd,
			status,
			title,
		});
	}

	public static initializeNew({
		ownerId,
		presetId,
		sourceBytes,
		sourceKey,
		sourceName,
		title,
	}: {
		ownerId: number;
		presetId: number;
		sourceBytes?: number;
		sourceKey?: string;
		sourceName?: string;
		title: string;
	}): DocumentEntity {
		return new DocumentEntity({
			budgetUsd: "10.0000",
			createdAt: "",
			cursorPageNo: 1,
			id: null,
			ownerId,
			pageCount: 0,
			presetId,
			sourceBytes: sourceBytes ?? null,
			sourceKey: sourceKey ?? null,
			sourceName: sourceName ?? null,
			spentUsd: "0.000000",
			status: DocumentStatus.DRAFT,
			title,
		});
	}

	public toNewObject(): {
		ownerId: number;
		pageCount: number;
		presetId: number;
		sourceBytes: null | number;
		sourceKey: null | string;
		sourceName: null | string;
		status: DocumentStatusValue;
		title: string;
	} {
		return {
			ownerId: this.ownerId,
			pageCount: this.pageCount,
			presetId: this.presetId,
			sourceBytes: this.sourceBytes,
			sourceKey: this.sourceKey,
			sourceName: this.sourceName,
			status: this.status,
			title: this.title,
		};
	}

	public toObject(): DocumentGetAllItemResponseDto {
		if (this.id === null) {
			throw new Error("Document ID is null. Entity must be persisted first.");
		}

		return {
			createdAt: this.createdAt,
			id: this.id,
			ownerId: this.ownerId,
			pageCount: this.pageCount,
			status: this.status,
			title: this.title,
		};
	}

	public toObjectWithPreset(): DocumentGetAllItemResponseDto & {
		preset: Preset;
		sourceKey: string;
	} {
		if (this.sourceKey === null) {
			throw new Error(DocumentErrorMessage.NO_SOURCE_KEY);
		}

		if (this.preset === null) {
			throw new Error(DocumentErrorMessage.NO_PRESET);
		}

		return {
			...this.toObject(),
			preset: this.preset,
			sourceKey: this.sourceKey,
		};
	}
}

export { DocumentEntity };
