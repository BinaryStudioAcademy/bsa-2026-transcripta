import { create, ingest, loadAll, loadById, remove } from "./actions.js";
import { actions } from "./documents.slice.js";

const allActions = {
	...actions,
	create,
	ingest,
	loadAll,
	loadById,
	remove,
};

export { allActions as actions };
export { reducer } from "./documents.slice.js";
