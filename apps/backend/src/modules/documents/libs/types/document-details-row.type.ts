import { type DocumentExportRawItem } from "./document-export-raw-item.type.js";
import { type DocumentStatusValue } from "./document-status-value.type.js";

type DocumentDetailsRow = {
	budgetUsd: string;
	closedPct: number;
	cursorPageNo: number;
	errorMessage: null | string;
	exports: DocumentExportRawItem[];
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

export { DocumentDetailsRow };
