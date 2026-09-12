import { createSelector } from "@reduxjs/toolkit";

import { MAX_LOADED_PAGES } from "~/libs/constants/varification.constants.js";
import { type RootState } from "~/libs/types/types.js";

const selectPagesDataStatus = (state: RootState) => state.pages.dataStatus;

const selectCurrentPage = (state: RootState) => {
	const pageId = state.pages.idsByPageNo[state.pages.cursorPageNo];

	return pageId ? state.pages.byId[pageId] : undefined;
};

const selectCursorPageNo = (state: RootState) => state.pages.cursorPageNo;

const selectPagesForStrip = createSelector(
	[
		(state: RootState) => state.pages.byId,
		(state: RootState) => state.pages.cursorPageNo,
		(state: RootState) => state.pages.idsByPageNo,
	],
	(byId, cursorPageNo, idsByPageNo) =>
		Object.keys(idsByPageNo)
			.map(Number)
			.filter((pageNo) => Math.abs(pageNo - cursorPageNo) <= MAX_LOADED_PAGES)
			.sort((a, b) => a - b)
			.map((pageNo) => byId[idsByPageNo[pageNo] as number]),
);

export {
	selectCurrentPage,
	selectCursorPageNo,
	selectPagesDataStatus,
	selectPagesForStrip,
};
