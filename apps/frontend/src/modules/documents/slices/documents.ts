import { loadAll, loadById } from "./actions.js";
import { actions } from "./documents.slice.js";

const allActions = {
	...actions,
	loadAll,
	loadById,
};

export { allActions as actions };
export { reducer } from "./documents.slice.js";
