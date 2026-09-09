import { type RootState } from "~/libs/types/types.js";

const selectPagesDataStatus = (state: RootState) => state.pages.dataStatus;

const selectCurrentPage = (state: RootState) => {
	const pageId = state.pages.idsByPageNo[state.pages.cursorPageNo];

	return pageId ? state.pages.byId[pageId] : undefined;
};

export { selectCurrentPage, selectPagesDataStatus };
