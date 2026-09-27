import { type SerializedAppError } from "~/libs/types/types.js";

import { type VerificationQueueItem } from "./verification-queue-item.type.js";

type VerificationQueueResult = {
	completedDocumentId: null | number;
	discarded: VerificationQueueItem[];
	failed: null | {
		error: SerializedAppError;
		item: VerificationQueueItem;
	};
};

export { type VerificationQueueResult };
