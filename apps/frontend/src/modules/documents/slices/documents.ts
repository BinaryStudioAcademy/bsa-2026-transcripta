import { create, ingest, loadAll, loadById } from "./actions.js";
import { actions } from "./documents.slice.js";

const allActions = {
	...actions,
	create,
	ingest,
	loadAll,
	loadById,
};

export { allActions as actions };
export { reducer } from "./documents.slice.js";
