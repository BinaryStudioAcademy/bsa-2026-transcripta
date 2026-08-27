import { type Entity } from "~/libs/types/types.js";

import {
	type DocumentListItemResponseDto,
	DocumentStatus,
	type DocumentStatusValue,
} from "./libs/types/types.js";

class DocumentEntity implements Entity {
	private createdAt: string;

	private id: null | number;

	private ownerId: number;

	private pageCount: number;

	private presetId: null | number;

	private status: DocumentStatusValue;

	private title: string;

	private constructor({
		createdAt,
		id,
		ownerId,
		pageCount,
		presetId,
		status,
		title,
	}: {
		createdAt: string;
		id: null | number;
		ownerId: number;
		pageCount: number;
		presetId: null | number;
		status: DocumentStatusValue;
		title: string;
	}) {
		this.createdAt = createdAt;
		this.id = id;
		this.ownerId = ownerId;
		this.pageCount = pageCount;
		this.presetId = presetId;
		this.status = status;
		this.title = title;
	}

	public static initialize({
		createdAt,
		id,
		ownerId,
		pageCount,
		presetId,
		status,
		title,
	}: {
		createdAt: string;
		id: number;
		ownerId: number;
		pageCount: number;
		presetId: null | number;
		status: DocumentStatusValue;
		title: string;
	}): DocumentEntity {
		return new DocumentEntity({
			createdAt,
			id,
			ownerId,
			pageCount,
			presetId,
			status,
			title,
		});
	}

	public static initializeNew({
		ownerId,
		presetId = null,
		title,
	}: {
		ownerId: number;
		presetId?: null | number;
		title: string;
	}): DocumentEntity {
		return new DocumentEntity({
			createdAt: "",
			id: null,
			ownerId,
			pageCount: 0,
			presetId,
			status: DocumentStatus.DRAFT,
			title,
		});
	}

	public toNewObject(): {
		ownerId: number;
		pageCount: number;
		presetId: null | number;
		status: DocumentStatusValue;
		title: string;
	} {
		return {
			ownerId: this.ownerId,
			pageCount: this.pageCount,
			presetId: this.presetId,
			status: this.status,
			title: this.title,
		};
	}

	public toObject(): DocumentListItemResponseDto {
		return {
			createdAt: this.createdAt,
			id: this.id as number,
			pageCount: this.pageCount,
			status: this.status,
			title: this.title,
		};
	}
}

export { DocumentEntity };
