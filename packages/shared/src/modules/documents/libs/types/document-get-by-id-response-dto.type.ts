import { type ValueOf } from "../../../../libs/types/value-of.type.js";
import { DocumentStatus } from "../enums/document-status.enum.js";

type DocumentGetByIdResponseDto = {
	budget: { limitUsd: string; spentUsd: string; usedPct: number };
	cursorPageNo: number;
	id: number;
	groundTruth: { cer: number; pagesTotal: number; pagesTyped: number } | null;
	pageCount: number;
	preset: { id: number; name: string; version: number };
	progress: {
		pagesTotal: number;
		pagesVerified: number;
		pagesReadyToCheck: number;
		pagesInWork: number;
		pagesFailed: number;
		pagesBlank: number;
		pagesSkipped: number;
		verifiedPct: number;
		closedPct: number;
	};
	status: ValueOf<typeof DocumentStatus>;
	title: string;
};

export { type DocumentGetByIdResponseDto };
