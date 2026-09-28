import { type LexiconEntryKindValue } from "@transcripta/shared";

import { type LexiconEntryType } from "./libs/types/types.js";

class LexiconEntryEntity {
	private createdAt: string;

	private distinctPages: number;

	private documentId: number;

	private firstPageNo: number;

	private id: number;

	private invalidatedAt: null | string;

	private invalidReason: null | string;

	private kind: LexiconEntryKindValue;

	private lastPageNo: number;

	private pageCount: number;

	private updatedAt: string;

	private valueDisplay: string;

	private valueNormalized: string;

	private constructor({
		createdAt,
		distinctPages,
		documentId,
		firstPageNo,
		id,
		invalidatedAt,
		invalidReason,
		kind,
		lastPageNo,
		pageCount,
		updatedAt,
		valueDisplay,
		valueNormalized,
	}: LexiconEntryType) {
		this.createdAt = createdAt;
		this.distinctPages = distinctPages;
		this.documentId = documentId;
		this.firstPageNo = firstPageNo;
		this.pageCount = pageCount;
		this.id = id;
		this.invalidatedAt = invalidatedAt;
		this.invalidReason = invalidReason;
		this.kind = kind;
		this.lastPageNo = lastPageNo;
		this.updatedAt = updatedAt;
		this.valueDisplay = valueDisplay;
		this.valueNormalized = valueNormalized;
	}

	public static initialize(payload: LexiconEntryType): LexiconEntryEntity {
		return new LexiconEntryEntity(payload);
	}

	public toObject(): LexiconEntryType {
		return {
			createdAt: this.createdAt,
			distinctPages: this.distinctPages,
			documentId: this.documentId,
			firstPageNo: this.firstPageNo,
			id: this.id,
			invalidatedAt: this.invalidatedAt,
			invalidReason: this.invalidReason,
			kind: this.kind,
			lastPageNo: this.lastPageNo,
			pageCount: this.pageCount,
			updatedAt: this.updatedAt,
			valueDisplay: this.valueDisplay,
			valueNormalized: this.valueNormalized,
		};
	}
}

export { LexiconEntryEntity };
