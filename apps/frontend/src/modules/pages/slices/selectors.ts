import { createSelector } from "@reduxjs/toolkit";
import { type PageStatusValue } from "@transcripta/shared";

import {
	DIVIDER_HALF,
	INDEX_NOT_FOUND,
	START_INDEX_FALLBACK,
} from "~/libs/constants/common.constants.js";
import { type RootState } from "~/libs/types/types.js";
import { MAX_LOADED_PAGES } from "~/pages/verification/libs/constants/verification.constants.js";

import { PageStatus } from "../libs/enums/enums.js";

const COMPLETED_PAGE_STATUSES = new Set<PageStatusValue>([
	PageStatus.BLANK,
	PageStatus.CONFIRMED,
	PageStatus.CORRECTED,
	PageStatus.SKIPPED,
]);

const selectPagesDataStatus = (state: RootState) => state.pages.dataStatus;

const selectReprocessingPageId = (state: RootState) =>
	state.pages.reprocessingPageId;

const selectVerificationDataStatus = (state: RootState) =>
	state.pages.verificationDataStatus;

const selectCurrentPage = (state: RootState) => {
	const pageId = state.pages.idsByPageNo[state.pages.cursorPageNo];

	return pageId ? state.pages.byId[pageId] : undefined;
};

const selectCursorPageNo = (state: RootState) => state.pages.cursorPageNo;

const selectLastVerifiedPageId = (state: RootState) =>
	state.pages.lastVerifiedPageId;

const selectPagesForStrip = createSelector(
	[
		(state: RootState) => state.pages.byId,
		(state: RootState) => state.pages.cursorPageNo,
		(state: RootState) => state.pages.idsByPageNo,
	],
	(byId, cursorPageNo, idsByPageNo) => {
		const pageNumbers = Object.keys(idsByPageNo)
			.map(Number)
			.sort((a, b) => a - b);

		const currentIndex = pageNumbers.indexOf(cursorPageNo);

		if (currentIndex === INDEX_NOT_FOUND) {
			return [];
		}

		const half = Math.floor(MAX_LOADED_PAGES / DIVIDER_HALF);

		let start = currentIndex - half;
		let end = start + MAX_LOADED_PAGES;

		if (start < START_INDEX_FALLBACK) {
			start = START_INDEX_FALLBACK;
			end = Math.min(pageNumbers.length, MAX_LOADED_PAGES);
		}

		if (end > pageNumbers.length) {
			end = pageNumbers.length;
			start = Math.max(START_INDEX_FALLBACK, end - MAX_LOADED_PAGES);
		}

		return pageNumbers
			.slice(start, end)
			.map((pageNo) => byId[idsByPageNo[pageNo] as number]);
	},
);

const selectVerificationCursorPageNo = createSelector(
	[
		(state: RootState) => state.pages.byId,
		(state: RootState) => state.pages.idsByPageNo,
	],
	(byId, idsByPageNo): null | number => {
		const pageNumbers = Object.keys(idsByPageNo)
			.map(Number)
			.sort((a, b) => a - b);

		const cursorPageNo = pageNumbers.find((pageNo) => {
			const page = byId[idsByPageNo[pageNo] as number];

			return page !== undefined && !COMPLETED_PAGE_STATUSES.has(page.status);
		});

		return cursorPageNo ?? null;
	},
);

export {
	selectCurrentPage,
	selectCursorPageNo,
	selectLastVerifiedPageId,
	selectPagesDataStatus,
	selectPagesForStrip,
	selectReprocessingPageId,
	selectVerificationCursorPageNo,
	selectVerificationDataStatus,
};
