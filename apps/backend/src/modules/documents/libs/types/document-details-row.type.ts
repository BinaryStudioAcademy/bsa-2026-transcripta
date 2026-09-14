import { type DocumentStatusValue } from "./document-status-value.type.js";

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
	status: DocumentStatusValue;
	title: string;
	verifiedPct: number;
};

export { DocumentDetailsRow };
