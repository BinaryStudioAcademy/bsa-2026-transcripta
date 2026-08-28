import {
	type DocumentListItemResponseDto,
	type DocumentStatusValue,
} from "./libs/types/types.js";

class DocumentEntity {
	private createdAt: string;

	private id: number;

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
		id: number;
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

	public toObject(): DocumentListItemResponseDto {
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
