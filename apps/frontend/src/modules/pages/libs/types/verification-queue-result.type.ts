import { type SerializedAppError } from "~/libs/types/types.js";

import { type VerificationQueueItem } from "./verification-queue-item.type.js";

type VerificationQueueResult = {
	discarded: VerificationQueueItem[];
	failed: null | {
		error: SerializedAppError;
		item: VerificationQueueItem;
	};
};

export { type VerificationQueueResult };
