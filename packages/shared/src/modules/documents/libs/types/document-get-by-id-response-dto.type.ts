import { type ValueOf } from "../../../../libs/types/value-of.type.js";
import { DocumentStatus } from "../enums/document-status.enum.js";

type DocumentGetByIdResponseDto = {
	budget: { limitUsd: string; spentUsd: string; usedPct: number };
	cursorPageNo: number;
	groundTruth: { cer: number; pagesTotal: number; pagesTyped: number } | null;
	id: number;
	pageCount: number;
	preset: { id: number; name: string; version: number };
	progress: {
		closedPct: number;
		pagesBlank: number;
		pagesFailed: number;
		pagesInWork: number;
		pagesReadyToCheck: number;
		pagesSkipped: number;
		pagesTotal: number;
		pagesVerified: number;
		verifiedPct: number;
	};
	status: ValueOf<typeof DocumentStatus>;
	title: string;
};

export { type DocumentGetByIdResponseDto };
