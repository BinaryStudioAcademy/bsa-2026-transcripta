import { create, loadAll, loadById } from "./actions.js";
import { actions } from "./presets.slice.js";

const allActions = {
	...actions,
	create,
	loadAll,
	loadById,
};

/** @public */
export { allActions as actions };
export { reducer } from "./presets.slice.js";
