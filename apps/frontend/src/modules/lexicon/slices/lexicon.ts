import { invalidate, loadByDocumentId } from "./actions.js";
import { actions } from "./lexicon.slice.js";

const allActions = {
	...actions,
	invalidate,
	loadByDocumentId,
};

/** @public */
export { allActions as actions };
export { reducer } from "./lexicon.slice.js";
