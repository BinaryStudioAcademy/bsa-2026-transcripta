import {
	create,
	getUploadUrl,
	ingest,
	loadAll,
	loadById,
	pause,
	pollDocumentById,
	remove,
	resume,
	startPolling,
	stopPolling,
	updateBudget,
} from "./actions.js";
import { actions } from "./documents.slice.js";

const allActions = {
	...actions,
	create,
	getUploadUrl,
	ingest,
	loadAll,
	loadById,
	pause,
	pollDocumentById,
	remove,
	resume,
	startPolling,
	stopPolling,
	updateBudget,
};

export { allActions as actions };
export { reducer } from "./documents.slice.js";
