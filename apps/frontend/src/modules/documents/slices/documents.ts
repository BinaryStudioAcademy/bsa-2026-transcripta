import { create, getUploadUrl, ingest, loadAll, loadById } from "./actions.js";
import { actions } from "./documents.slice.js";

const allActions = {
	...actions,
	create,
	getUploadUrl,
	ingest,
	loadAll,
	loadById,
};

export { allActions as actions };
export { reducer } from "./documents.slice.js";
