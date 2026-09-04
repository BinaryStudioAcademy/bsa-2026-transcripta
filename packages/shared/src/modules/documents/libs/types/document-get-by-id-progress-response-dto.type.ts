type DocumentGetByIdProgressResponseDto = {
	closedPct: number;
	pagesBlank: number;
	pagesFailed: number;
	pagesInWork: number;
	pagesPending: number;
	pagesReadyToCheck: number;
	pagesSkipped: number;
	pagesTotal: number;
	pagesVerified: number;
	verifiedPct: number;
};

export { type DocumentGetByIdProgressResponseDto };
