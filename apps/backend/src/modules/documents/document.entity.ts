import { DocumentStatus, type ValueOf } from "@transcripta/shared";

import { type DocumentGetAllItemResponseDto } from "./libs/types/types.js";

type DocumentStatusValue = ValueOf<typeof DocumentStatus>;

class DocumentEntity {
	private createdAt: string;

	private id: null | number;

	private ownerId: number;

	private pageCount: number;

	private presetId: number;

	private sourceBytes: null | number;

	private sourceKey: null | string;

	private sourceName: null | string;

	private status: DocumentStatusValue;

	private title: string;

	private constructor({
		createdAt,
		id,
		ownerId,
		pageCount,
		presetId,
		sourceBytes,
		sourceKey,
		sourceName,
		status,
		title,
	}: {
		createdAt: string;
		id: null | number;
		ownerId: number;
		pageCount: number;
		presetId: number;
		sourceBytes: null | number;
		sourceKey: null | string;
		sourceName: null | string;
		status: DocumentStatusValue;
		title: string;
	}) {
		this.createdAt = createdAt;
		this.id = id;
		this.ownerId = ownerId;
		this.pageCount = pageCount;
		this.presetId = presetId;
		this.sourceBytes = sourceBytes;
		this.sourceKey = sourceKey;
		this.sourceName = sourceName;
		this.status = status;
		this.title = title;
	}

	public static initialize({
		createdAt,
		id,
		ownerId,
		pageCount,
		presetId,
		sourceBytes,
		sourceKey,
		sourceName,
		status,
		title,
	}: {
		createdAt: string;
		id: number;
		ownerId: number;
		pageCount: number;
		presetId: number;
		sourceBytes?: null | number;
		sourceKey?: null | string;
		sourceName?: null | string;
		status: DocumentStatusValue;
		title: string;
	}): DocumentEntity {
		return new DocumentEntity({
			createdAt,
			id,
			ownerId,
			pageCount,
			presetId,
			sourceBytes: sourceBytes ?? null,
			sourceKey: sourceKey ?? null,
			sourceName: sourceName ?? null,
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
			createdAt: "",
			id: null,
			ownerId,
			pageCount: 0,
			presetId,
			sourceBytes: sourceBytes ?? null,
			sourceKey: sourceKey ?? null,
			sourceName: sourceName ?? null,
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
			pageCount: this.pageCount,
			status: this.status,
			title: this.title,
		};
	}
}

export { DocumentEntity };
