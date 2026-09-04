import { loadAll, upload } from "./actions.js";
import { actions } from "./documents.slice.js";

const allActions = {
	...actions,
	loadAll,
	upload,
};

export { allActions as actions };
export { reducer } from "./documents.slice.js";
