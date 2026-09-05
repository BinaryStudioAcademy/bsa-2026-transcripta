import { PageStatus } from "./libs/enums/enums.js";
import { type ValueOf } from "./libs/types/types.js";

type PageStatusValue = ValueOf<typeof PageStatus>;

class PageEntity {
	private attempts: number;

	private createdAt: string;

	private documentId: number;

	private id: null | number;

	private imageKey: null | string;

	private imageSha256: null | string;

	private lastError: null | string;

	private pageNo: number;

	private status: PageStatusValue;

	private thumbKey: null | string;

	private updatedAt: string;

	private verifiedAt: null | string;

	private verifiedBy: null | number;

	private constructor({
		attempts,
		createdAt,
		documentId,
		id,
		imageKey,
		imageSha256,
		lastError,
		pageNo,
		status,
		thumbKey,
		updatedAt,
		verifiedAt,
		verifiedBy,
	}: {
		attempts: number;
		createdAt: string;
		documentId: number;
		id: null | number;
		imageKey: null | string;
		imageSha256: null | string;
		lastError: null | string;
		pageNo: number;
		status: PageStatusValue;
		thumbKey: null | string;
		updatedAt: string;
		verifiedAt: null | string;
		verifiedBy: null | number;
	}) {
		this.attempts = attempts;
		this.createdAt = createdAt;
		this.documentId = documentId;
		this.id = id;
		this.imageKey = imageKey;
		this.imageSha256 = imageSha256;
		this.lastError = lastError;
		this.pageNo = pageNo;
		this.status = status;
		this.thumbKey = thumbKey;
		this.updatedAt = updatedAt;
		this.verifiedAt = verifiedAt;
		this.verifiedBy = verifiedBy;
	}

	public static initialize({
		attempts,
		createdAt,
		documentId,
		id,
		imageKey,
		imageSha256,
		lastError,
		pageNo,
		status,
		thumbKey,
		updatedAt,
		verifiedAt,
		verifiedBy,
	}: {
		attempts: number;
		createdAt: string;
		documentId: number;
		id: number;
		imageKey?: null | string;
		imageSha256?: null | string;
		lastError?: null | string;
		pageNo: number;
		status: PageStatusValue;
		thumbKey?: null | string;
		updatedAt: string;
		verifiedAt?: null | string;
		verifiedBy?: null | number;
	}): PageEntity {
		return new PageEntity({
			attempts,
			createdAt,
			documentId,
			id,
			imageKey: imageKey ?? null,
			imageSha256: imageSha256 ?? null,
			lastError: lastError ?? null,
			pageNo,
			status,
			thumbKey: thumbKey ?? null,
			updatedAt,
			verifiedAt: verifiedAt ?? null,
			verifiedBy: verifiedBy ?? null,
		});
	}

	public static initializeNew({
		documentId,
		imageKey,
		imageSha256,
		pageNo,
		status,
		thumbKey,
	}: {
		documentId: number;
		imageKey: string;
		imageSha256: string;
		pageNo: number;
		status: PageStatusValue;
		thumbKey: string;
	}): PageEntity {
		return new PageEntity({
			attempts: 0,
			createdAt: "",
			documentId,
			id: null,
			imageKey,
			imageSha256,
			lastError: null,
			pageNo,
			status,
			thumbKey,
			updatedAt: "",
			verifiedAt: null,
			verifiedBy: null,
		});
	}

	public toNewObject(): {
		attempts: number;
		documentId: number;
		imageKey: null | string;
		imageSha256: null | string;
		lastError: null | string;
		pageNo: number;
		status: PageStatusValue;
		thumbKey: null | string;
		verifiedAt: null | string;
		verifiedBy: null | number;
	} {
		return {
			attempts: this.attempts,
			documentId: this.documentId,
			imageKey: this.imageKey,
			imageSha256: this.imageSha256,
			lastError: this.lastError,
			pageNo: this.pageNo,
			status: this.status,
			thumbKey: this.thumbKey,
			verifiedAt: this.verifiedAt,
			verifiedBy: this.verifiedBy,
		};
	}

	public toObject(): {
		attempts: number;
		createdAt: string;
		documentId: number;
		id: number;
		imageKey: null | string;
		imageSha256: null | string;
		lastError: null | string;
		pageNo: number;
		status: PageStatusValue;
		thumbKey: null | string;
		updatedAt: string;
		verifiedAt: null | string;
		verifiedBy: null | number;
	} {
		return {
			attempts: this.attempts,
			createdAt: this.createdAt,
			documentId: this.documentId,
			id: this.id as number,
			imageKey: this.imageKey,
			imageSha256: this.imageSha256,
			lastError: this.lastError,
			pageNo: this.pageNo,
			status: this.status,
			thumbKey: this.thumbKey,
			updatedAt: this.updatedAt,
			verifiedAt: this.verifiedAt,
			verifiedBy: this.verifiedBy,
		};
	}
}

export { PageEntity };
