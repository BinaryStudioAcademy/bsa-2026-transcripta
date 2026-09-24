import { loadAll, loadById } from "./actions.js";
import { actions } from "./presets.slice.js";

const allActions = {
	...actions,
	loadAll,
	loadById,
};

/** @public */
export { allActions as actions };
export { reducer } from "./presets.slice.js";
