import { create, loadAll, loadById } from "./actions.js";
import { actions } from "./documents.slice.js";

const allActions = {
	...actions,
	create,
	loadAll,
	loadById,
};

export { allActions as actions };
export { reducer } from "./documents.slice.js";
