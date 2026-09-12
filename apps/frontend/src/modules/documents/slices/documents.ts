import {
	create,
	getUploadUrl,
	ingest,
	loadAll,
	loadById,
	pollDocumentById,
	remove,
	startPolling,
	stopPolling,
} from "./actions.js";
import { actions } from "./documents.slice.js";

const allActions = {
	...actions,
	create,
	getUploadUrl,
	ingest,
	loadAll,
	loadById,
	pollDocumentById,
	remove,
	startPolling,
	stopPolling,
};

export { allActions as actions };
export { reducer } from "./documents.slice.js";
