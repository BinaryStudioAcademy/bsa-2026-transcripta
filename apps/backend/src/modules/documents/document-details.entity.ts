import { DocumentStatus, type ValueOf } from "@transcripta/shared";

import { type DocumentGetByIdResponseDto } from "./libs/types/types.js";

type DocumentDetailsProperties = {
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
	status: DocumentStatusValue;
	title: string;
	usedPct: number;
	verifiedPct: number;
};

type DocumentStatusValue = ValueOf<typeof DocumentStatus>;

class DocumentDetailsEntity {
	private budgetUsd: string;

	private closedPct: number;

	private cursorPageNo: number;

	private id: number;

	private pageCount: number;

	private pagesBlank: number;

	private pagesFailed: number;

	private pagesInWork: number;

	private pagesPending: number;

	private pagesReadyToCheck: number;

	private pagesSkipped: number;

	private pagesTotal: number;

	private pagesVerified: number;

	private presetId: number;

	private presetName: string;

	private presetVersion: number;

	private spentUsd: string;

	private status: DocumentStatusValue;

	private title: string;

	private usedPct: number;

	private verifiedPct: number;

	private constructor({
		budgetUsd,
		closedPct,
		cursorPageNo,
		id,
		pageCount,
		pagesBlank,
		pagesFailed,
		pagesInWork,
		pagesPending,
		pagesReadyToCheck,
		pagesSkipped,
		pagesTotal,
		pagesVerified,
		presetId,
		presetName,
		presetVersion,
		spentUsd,
		status,
		title,
		usedPct,
		verifiedPct,
	}: DocumentDetailsProperties) {
		this.budgetUsd = budgetUsd;
		this.closedPct = closedPct;
		this.cursorPageNo = cursorPageNo;
		this.id = id;
		this.pageCount = pageCount;
		this.pagesBlank = pagesBlank;
		this.pagesFailed = pagesFailed;
		this.pagesInWork = pagesInWork;
		this.pagesPending = pagesPending;
		this.pagesReadyToCheck = pagesReadyToCheck;
		this.pagesSkipped = pagesSkipped;
		this.pagesTotal = pagesTotal;
		this.pagesVerified = pagesVerified;
		this.presetId = presetId;
		this.presetName = presetName;
		this.presetVersion = presetVersion;
		this.spentUsd = spentUsd;
		this.status = status;
		this.title = title;
		this.usedPct = usedPct;
		this.verifiedPct = verifiedPct;
	}

	public static initialize(
		properties: DocumentDetailsProperties,
	): DocumentDetailsEntity {
		return new DocumentDetailsEntity(properties);
	}

	public toObject(): DocumentGetByIdResponseDto {
		return {
			budget: {
				limitUsd: this.budgetUsd,
				spentUsd: this.spentUsd,
				usedPct: this.usedPct,
			},
			cursorPageNo: this.cursorPageNo,
			groundTruth: null,
			id: this.id,
			pageCount: this.pageCount,
			preset: {
				id: this.presetId,
				name: this.presetName,
				version: this.presetVersion,
			},
			progress: {
				closedPct: this.closedPct,
				pagesBlank: this.pagesBlank,
				pagesFailed: this.pagesFailed,
				pagesInWork: this.pagesInWork,
				pagesPending: this.pagesPending,
				pagesReadyToCheck: this.pagesReadyToCheck,
				pagesSkipped: this.pagesSkipped,
				pagesTotal: this.pagesTotal,
				pagesVerified: this.pagesVerified,
				verifiedPct: this.verifiedPct,
			},
			status: this.status,
			title: this.title,
		};
	}
}

export { DocumentDetailsEntity };
