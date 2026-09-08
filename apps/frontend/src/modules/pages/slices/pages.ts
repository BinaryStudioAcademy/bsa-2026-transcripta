import { actions } from "./pages.slice.js";

const allActions = {
	...actions,
};

/** @public */
export { allActions as actions };
export { reducer } from "./pages.slice.js";
