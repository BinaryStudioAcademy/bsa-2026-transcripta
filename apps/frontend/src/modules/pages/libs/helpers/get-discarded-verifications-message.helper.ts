import { VerificationQueueMessage } from "../constants/constants.js";
import { type VerificationQueueItem } from "../types/types.js";

const getDiscardedVerificationsMessage = (
	items: VerificationQueueItem[],
): string => {
	const list = items
		.map(({ pageNo, payload }) => `page ${String(pageNo)} (${payload.action})`)
		.join(", ");

	return `${VerificationQueueMessage.DISCARDED} ${list}`;
};

export { getDiscardedVerificationsMessage };
