import { loadPages, undoPage, verifyPage } from "./actions.js";
import { actions } from "./pages.slice.js";

const allActions = {
	...actions,
	loadPages,
	undoPage,
	verifyPage,
};

/** @public */
export { allActions as actions };
export { reducer } from "./pages.slice.js";
