import { loadPages, reprocessPage, undoPage, verifyPage } from "./actions.js";
import { actions } from "./pages.slice.js";

const allActions = {
	...actions,
	loadPages,
	reprocessPage,
	undoPage,
	verifyPage,
};

/** @public */
export { allActions as actions };
export { reducer } from "./pages.slice.js";
