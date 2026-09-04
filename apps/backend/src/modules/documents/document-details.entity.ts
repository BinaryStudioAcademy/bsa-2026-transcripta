import { DocumentStatus, type ValueOf } from "@transcripta/shared";

import { type DocumentGetByIdResponseDto } from "./libs/types/types.js";

type DocumentStatusValue = ValueOf<typeof DocumentStatus>;

const BUDGET_FRACTION_DIGITS = 2;
const BUDGET_USED_PERCENT_MULTIPLIER = 100;
const BUDGET_USED_PERCENT_ROUNDING_FACTOR = 10;
const ZERO_BUDGET_LIMIT_USD = 0;
const ZERO_BUDGET_USED_PERCENT = 0;

class DocumentDetailsEntity {
	private budgetUsd: string;

	private closedPct: number;

	private cursorPageNo: number;

	private id: number;

	private pageCount: number;

	private pagesBlank: number;

	private pagesFailed: number;

	private pagesInWork: number;

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
		verifiedPct,
	}: {
		budgetUsd: string;
		closedPct: number;
		cursorPageNo: number;
		id: number;
		pageCount: number;
		pagesBlank: number;
		pagesFailed: number;
		pagesInWork: number;
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
		verifiedPct: number;
	}) {
		this.budgetUsd = budgetUsd;
		this.closedPct = closedPct;
		this.cursorPageNo = cursorPageNo;
		this.id = id;
		this.pageCount = pageCount;
		this.pagesBlank = pagesBlank;
		this.pagesFailed = pagesFailed;
		this.pagesInWork = pagesInWork;
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
		this.verifiedPct = verifiedPct;
	}

	public static initialize({
		budgetUsd,
		closedPct,
		cursorPageNo,
		id,
		pageCount,
		pagesBlank,
		pagesFailed,
		pagesInWork,
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
		verifiedPct,
	}: {
		budgetUsd: string;
		closedPct: number;
		cursorPageNo: number;
		id: number;
		pageCount: number;
		pagesBlank: number;
		pagesFailed: number;
		pagesInWork: number;
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
		verifiedPct: number;
	}): DocumentDetailsEntity {
		return new DocumentDetailsEntity({
			budgetUsd,
			closedPct,
			cursorPageNo,
			id,
			pageCount,
			pagesBlank,
			pagesFailed,
			pagesInWork,
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
			verifiedPct,
		});
	}

	private calculateUsedPct(): number {
		const limitUsd = Number(this.budgetUsd);

		if (limitUsd === ZERO_BUDGET_LIMIT_USD) {
			return ZERO_BUDGET_USED_PERCENT;
		}

		const usedPct =
			(Number(this.spentUsd) / limitUsd) * BUDGET_USED_PERCENT_MULTIPLIER;

		return (
			Math.round(usedPct * BUDGET_USED_PERCENT_ROUNDING_FACTOR) /
			BUDGET_USED_PERCENT_ROUNDING_FACTOR
		);
	}

	private formatMoney(value: string): string {
		return Number(value).toFixed(BUDGET_FRACTION_DIGITS);
	}

	public toObject(): DocumentGetByIdResponseDto {
		return {
			budget: {
				limitUsd: this.formatMoney(this.budgetUsd),
				spentUsd: this.formatMoney(this.spentUsd),
				usedPct: this.calculateUsedPct(),
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
